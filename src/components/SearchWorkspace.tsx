"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "@phosphor-icons/react";
import { css } from "styled-system/css";
import { BoardPanel } from "@/components/BoardPanel";
import { BrandHeadline } from "@/components/BrandHeadline";
import { iconDefaults } from "@/components/Icon";
import { Navbar } from "@/components/Navbar";
import { RecentBoards } from "@/components/RecentBoards";
import { ResultsGrid, type SearchStatus } from "@/components/ResultsGrid";
import { SearchField } from "@/components/SearchField";
import { SearchSuggestions } from "@/components/SearchSuggestions";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import type { BoardItem, BoardSummary, SearchApiResponse, SearchImage } from "@/types";

/**
 * Board de destino do "modo contextual de adição" — o usuário chegou aqui de
 * `/favoritos/[id]` pelo botão "Adicionar inspirações", e o que favoritar vai
 * direto pra este board. `itemIds` são as imagens que já estavam no board na
 * entrada: servem pra marcar o coração como cheio e pra não recontar o que já
 * estava lá no toast de volta.
 */
type ActiveBoard = {
  id: string;
  name: string;
  itemIds: { unsplashId: string; imageId: string }[];
};

/** Uma imagem favoritada na busca vira `BoardItem` (ainda em memória, antes de salvar). */
function toBoardItem(image: SearchImage): BoardItem {
  return {
    id: image.id,
    unsplashId: image.id,
    description: image.description,
    author: image.author,
    aspectRatio: image.aspectRatio,
    imageUrl: image.imageUrl,
    thumbUrl: image.thumbUrl,
  };
}

/** Board pré-existente do usuário, na forma enxuta usada pra casar o nome digitado. */
type ExistingBoard = { id: string; name: string };

/**
 * Normaliza um nome de board pra comparação: sem espaço nas pontas, espaços
 * internos colapsados e caixa neutra. "  Minimalismo " e "minimalismo" batem.
 */
function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLocaleLowerCase("pt-BR");
}

/** Rascunho do board em construção, guardado no `localStorage` até salvar. */
const DRAFT_KEY = "moodboard:draft-board";
type DraftBoard = { name: string; items: BoardItem[] };

function readDraft(): DraftBoard | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DraftBoard>;
    if (!parsed || !Array.isArray(parsed.items)) return null;
    return {
      name: typeof parsed.name === "string" ? parsed.name : "",
      items: parsed.items as BoardItem[],
    };
  } catch {
    return null;
  }
}

function writeDraft(draft: DraftBoard) {
  if (typeof window === "undefined") return;
  try {
    if (draft.items.length === 0) {
      window.localStorage.removeItem(DRAFT_KEY);
    } else {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }
  } catch {
    // localStorage indisponível (aba anônima, cota cheia) — segue sem persistir.
  }
}

/** Desfecho da última busca concluída, marcado com o termo a que pertence. */
type SearchOutcome =
  | { query: string; kind: "response"; body: SearchApiResponse }
  | { query: string; kind: "networkError" };

/**
 * Traduz o desfecho guardado + o termo atual em `status`/`results` para o `ResultsGrid`.
 * Enquanto o desfecho não corresponde ao termo atual (debounce pendente ou requisição
 * em voo), o estado é "loading".
 */
function deriveSearchState(
  currentQuery: string,
  outcome: SearchOutcome | null,
): { status: SearchStatus; results: SearchImage[] } {
  if (!currentQuery || !outcome || outcome.query !== currentQuery) {
    return { status: "loading", results: [] };
  }
  if (outcome.kind === "networkError") {
    return { status: "networkError", results: [] };
  }
  if (!outcome.body.ok) {
    return {
      status: outcome.body.error === "rate_limit" ? "rateLimit" : "apiError",
      results: [],
    };
  }
  const results = outcome.body.results;
  return { status: results.length === 0 ? "empty" : "success", results };
}

/**
 * Tela principal do produto (rota `/`): busca → grid de resultados → favoritar → montar board.
 *
 * Estado inicial: título + campo de busca centralizados na tela (hero limpo). Depois da
 * primeira busca, a busca sobe para o topo, o grid aparece e o board se forma abaixo dos
 * resultados.
 *
 * Fluxo:
 * - a busca consome a Unsplash de verdade via `GET /api/search` (Fase 2), com debounce
 *   na digitação para não disparar uma requisição por tecla;
 * - favoritos persistem entre buscas diferentes (só na sessão, até salvar);
 * - "Salvar" grava o board no Supabase (`POST /api/boards`) — cria a linha em
 *   `boards` (com slug público) e uma em `board_images` por item — e só então o
 *   toast "Salvo." aparece. Salvo, o board limpa pra começar outro.
 * - se o nome digitado bater (ignorando caixa/espaço) com um board que já existe,
 *   antes de salvar aparece um aviso oferecendo somar as imagens naquele board
 *   em vez de criar um segundo board com o mesmo nome;
 * - o board em construção (favoritos ainda não salvos + nome digitado) fica no
 *   `localStorage`, então sair pra `/favoritos` e voltar não perde o trabalho.
 *
 * `activeBoard` (vindo de `?add=<id>`) liga o **modo contextual**: some a bottom
 * bar de montar board, entra um badge fixo "Adicionando a X", e favoritar grava
 * direto naquele board (sem modal de nomear, sem checagem de nome — o destino já
 * é explícito). Sair do modo (o "x" do badge) não descarta o que já foi salvo.
 *
 * O acesso a esta tela é protegido pelo middleware de sessão (Fase 3).
 */
export function SearchWorkspace({
  recentBoards,
  totalBoardCount,
  existingBoards,
  activeBoard = null,
}: {
  recentBoards: BoardSummary[];
  totalBoardCount: number;
  existingBoards: ExistingBoard[];
  activeBoard?: ActiveBoard | null;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [board, setBoard] = useState<BoardItem[]>([]);
  const [boardName, setBoardName] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // Board existente cujo nome bate com o digitado — dispara o aviso "somar ou criar novo?".
  const [nameClash, setNameClash] = useState<ExistingBoard | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Só passa a persistir o rascunho depois de tentar restaurar o que havia.
  const draftHydrated = useRef(false);

  // Só guarda o desfecho da última busca concluída (com o termo a que ele pertence).
  // `status` e `results` são derivados disso — assim o efeito nunca chama setState de
  // forma síncrona, só dentro dos callbacks async do fetch.
  const [outcome, setOutcome] = useState<SearchOutcome | null>(null);

  // --- Modo contextual de adição (`?add=<id>`) -----------------------------
  // Staging das inspirações escolhidas pra somar no board de destino. Favoritar
  // aqui NÃO grava — acumula (o usuário vai clicando corações, a barra conta) e
  // um clique só em "Adicionar +N" faz o append em lote no board.
  const [staged, setStaged] = useState<BoardItem[]>([]);
  const [addingToBoard, setAddingToBoard] = useState(false);
  // Board de destino atual — pra zerar o staging quando o modo desliga/troca de
  // board sem que o componente remonte (`/` ↔ `/?add=`).
  const [ctxBoardId, setCtxBoardId] = useState<string | null>(activeBoard?.id ?? null);
  if ((activeBoard?.id ?? null) !== ctxBoardId) {
    setCtxBoardId(activeBoard?.id ?? null);
    setStaged([]);
    setAddingToBoard(false);
  }
  // Unsplash ids que já estão no board de destino — coração cheio + clique
  // ignorado (não deixa somar a mesma foto duas vezes).
  const boardImageIds = useMemo(
    () => new Set(activeBoard?.itemIds.map((item) => item.unsplashId) ?? []),
    [activeBoard],
  );

  const debouncedQuery = useDebouncedValue(query.trim(), 400);
  const favoriteIds = useMemo(
    () =>
      activeBoard
        ? new Set([...boardImageIds, ...staged.map((item) => item.id)])
        : new Set(board.map((item) => item.id)),
    [activeBoard, boardImageIds, staged, board],
  );
  // Bottom bar na tela? (board em construção no fluxo normal, escolhas pendentes
  // no modo contextual) — dirige o respiro no rodapé e a altura do toast.
  const panelOpen = activeBoard ? staged.length > 0 : board.length > 0;

  // Sugestões de autocomplete pro campo "Nome do board": boards já salvos cujo
  // nome CONTÉM o que foi digitado (ex.: "veloz" → "Board moto veloz"). Some
  // quando o texto casa exatamente com um board — aí o próprio "Salvar" já
  // oferece somar nele.
  const nameSuggestions = useMemo(() => {
    const typed = normalizeName(boardName);
    if (!typed) return [];
    const seen = new Set<string>();
    const out: string[] = [];
    for (const candidate of existingBoards) {
      const normalized = normalizeName(candidate.name);
      if (normalized === typed || !normalized.includes(typed)) continue;
      if (seen.has(normalized)) continue;
      seen.add(normalized);
      out.push(candidate.name);
      if (out.length === 6) break;
    }
    return out;
  }, [boardName, existingBoards]);
  const hasSearched = query.trim().length > 0;
  // Faixa de boards recentes só no estado inicial e só se o usuário já tem boards.
  const showRecent = !hasSearched && recentBoards.length > 0;

  const { status, results } = deriveSearchState(debouncedQuery, outcome);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  // Restaura o rascunho do board (favoritos + nome) salvo no `localStorage` numa
  // visita anterior. Roda uma vez, depois da montagem (o HTML do servidor nunca
  // tem rascunho — restaurar num microtask evita descasar com ele).
  useEffect(() => {
    const draft = readDraft();
    queueMicrotask(() => {
      if (draft && draft.items.length > 0) {
        setBoard((current) => (current.length > 0 ? current : draft.items));
        setBoardName((current) => current || draft.name);
      }
      draftHydrated.current = true;
    });
  }, []);

  // Persiste o rascunho a cada mudança (só depois da tentativa de restauração,
  // pra não sobrescrever com o estado vazio inicial). Ao salvar, `board` esvazia
  // e isso limpa a chave.
  useEffect(() => {
    if (!draftHydrated.current) return;
    writeDraft({ name: boardName, items: board });
  }, [board, boardName]);

  // Busca real na Unsplash: dispara quando o termo (já com debounce) muda; aborta a
  // requisição anterior se o usuário continuar digitando.
  useEffect(() => {
    if (!debouncedQuery) return;

    const controller = new AbortController();

    (async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`, {
          signal: controller.signal,
        });
        const body = (await response.json()) as SearchApiResponse;
        setOutcome({ query: debouncedQuery, kind: "response", body });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setOutcome({ query: debouncedQuery, kind: "networkError" });
      }
    })();

    return () => controller.abort();
  }, [debouncedQuery]);

  function flashToast(message: string) {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }

  function toggleFavorite(image: SearchImage) {
    if (activeBoard) {
      // Já está no board de destino: coração fica cheio, clique não faz nada.
      if (boardImageIds.has(image.id)) return;
      setStaged((current) =>
        current.some((item) => item.id === image.id)
          ? current.filter((item) => item.id !== image.id)
          : [...current, toBoardItem(image)],
      );
      return;
    }
    setBoard((current) =>
      current.some((item) => item.id === image.id)
        ? current.filter((item) => item.id !== image.id)
        : [...current, toBoardItem(image)],
    );
  }

  /**
   * "Adicionar +N": soma as inspirações escolhidas no board de destino, num
   * append em lote (`POST /api/boards` com `boardId`, a mesma rota do merge por
   * nome), e volta pro board com a contagem pro toast de lá.
   */
  async function addStagedToBoard() {
    if (!activeBoard || staged.length === 0 || addingToBoard) return;
    const count = staged.length;
    setAddingToBoard(true);
    try {
      const response = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boardId: activeBoard.id,
          items: staged.map((item) => ({
            unsplashId: item.unsplashId,
            imageUrl: item.imageUrl,
            thumbUrl: item.thumbUrl,
            author: item.author,
            description: item.description,
          })),
        }),
      });
      if (!response.ok) {
        flashToast(
          response.status === 404
            ? "Esse board não existe mais."
            : "Não deu pra adicionar agora. Tenta de novo.",
        );
        return;
      }
      setStaged([]);
      router.push(`/favoritos/${activeBoard.id}?adicionadas=${count}`);
    } catch {
      flashToast("Falha de conexão. Tenta de novo.");
    } finally {
      setAddingToBoard(false);
    }
  }

  /** Sai do modo contextual (descarta o staging ainda não somado, sem aviso). */
  function exitContextMode() {
    setStaged([]);
    router.push("/");
    router.refresh();
  }

  /** Volta pro board: se há escolhas pendentes, soma antes; senão só navega. */
  function backToActiveBoard() {
    if (!activeBoard) return;
    if (staged.length > 0) {
      void addStagedToBoard();
      return;
    }
    router.push(`/favoritos/${activeBoard.id}`);
  }

  function removeFromStaged(id: string) {
    setStaged((current) => current.filter((item) => item.id !== id));
  }

  function removeFromBoard(id: string) {
    setBoard((current) => current.filter((item) => item.id !== id));
  }

  /**
   * "Salvar" no `BoardPanel`. Se o nome digitado casa com um board que já existe,
   * abre o aviso "somar ou criar novo?" em vez de salvar direto; senão, cria.
   */
  function requestSave() {
    if (board.length === 0 || saving) return;
    const typed = normalizeName(boardName);
    const match = typed
      ? existingBoards.find((candidate) => normalizeName(candidate.name) === typed)
      : undefined;
    if (match) {
      setNameClash(match);
      return;
    }
    void saveBoard(null);
  }

  /** Grava o board: cria um novo, ou (se `mergeInto`) soma as imagens num existente. */
  async function saveBoard(mergeInto: ExistingBoard | null) {
    if (board.length === 0 || saving) return;
    setNameClash(null);
    setSaving(true);
    try {
      const response = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: boardName.trim(),
          searchTerm: query.trim() || null,
          boardId: mergeInto?.id,
          items: board.map((item) => ({
            unsplashId: item.unsplashId,
            imageUrl: item.imageUrl,
            thumbUrl: item.thumbUrl,
            author: item.author,
            description: item.description,
          })),
        }),
      });

      if (!response.ok) {
        flashToast("Não deu pra salvar agora. Tenta de novo.");
        return;
      }

      flashToast(mergeInto ? `Adicionado a “${mergeInto.name}”.` : "Salvo.");
      setBoard([]);
      setBoardName("");
      // Atualiza os boards recentes e a lista usada pra casar nomes — assim um
      // segundo "Salvar" na mesma sessão já enxerga o board recém-criado.
      router.refresh();
    } catch {
      flashToast("Falha de conexão. Tenta de novo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className={css({
        minH: "100dvh",
        bg: "page",
        display: "flex",
        flexDir: "column",
        // `clip` e não `hidden`: corta o transbordo horizontal sem virar um
        // container de scroll — se fosse `hidden`, o badge `position: sticky`
        // abaixo passaria a "colar" nesse div (que não rola) em vez de na viewport.
        overflowX: "clip",
      })}
    >
      <Navbar />

      {/* Modo contextual: badge fixo com o board de destino, "Voltar ao board" e
          um "x" pra sair do modo (sem descartar o que já foi salvo). */}
      {activeBoard && (
        <div
          className={css({
            position: "sticky",
            top: "0",
            zIndex: "banner",
            bg: "brand.2",
            borderBottomWidth: "1px",
            borderBottomStyle: "solid",
            borderBottomColor: "brand.5",
          })}
        >
          <div
            className={css({
              w: "full",
              maxW: "1120px",
              mx: "auto",
              px: { base: "5", md: "8" },
              py: "2.5",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "3",
              flexWrap: "wrap",
            })}
          >
            <button
              type="button"
              onClick={backToActiveBoard}
              className={css({
                minW: "0",
                textAlign: "left",
                border: "none",
                bg: "transparent",
                cursor: "pointer",
                fontFamily: "body",
                fontSize: "sm",
                color: "brand.11",
                _focusVisible: {
                  outline: "2px solid",
                  outlineColor: "ctaPurple",
                  outlineOffset: "2px",
                },
              })}
            >
              Adicionando a{" "}
              <strong className={css({ fontWeight: "semibold", color: "brand.12" })}>
                {activeBoard.name}
              </strong>
            </button>

            <div className={css({ display: "flex", alignItems: "center", gap: "1" })}>
              <button
                type="button"
                onClick={backToActiveBoard}
                className={css({
                  h: "32px",
                  px: "3.5",
                  rounded: "full",
                  borderWidth: "1px",
                  borderStyle: "solid",
                  borderColor: "brand.5",
                  bg: "surface",
                  cursor: "pointer",
                  fontFamily: "body",
                  fontSize: "sm",
                  color: "brand.11",
                  transition: "background-color 0.15s ease",
                  _hover: { bg: "brand.3" },
                  _focusVisible: {
                    outline: "2px solid",
                    outlineColor: "ctaPurple",
                    outlineOffset: "2px",
                  },
                })}
              >
                Voltar ao board
              </button>
              <button
                type="button"
                onClick={exitContextMode}
                aria-label="Sair do modo de adição"
                className={css({
                  flexShrink: "0",
                  display: "grid",
                  placeItems: "center",
                  w: "32px",
                  h: "32px",
                  rounded: "full",
                  border: "none",
                  cursor: "pointer",
                  bg: "transparent",
                  color: "brand.11",
                  transition: "background-color 0.15s ease",
                  _hover: { bg: "brand.3" },
                  _focusVisible: {
                    outline: "2px solid",
                    outlineColor: "ctaPurple",
                    outlineOffset: "2px",
                  },
                })}
              >
                <X {...iconDefaults} size={16} aria-hidden />
              </button>
            </div>
          </div>
        </div>
      )}

      <main
        className={css({
          flex: "1",
          w: "full",
          maxW: "1120px",
          mx: "auto",
          px: { base: "5", md: "8" },
          // Espaço extra no rodapé enquanto a bottom bar do board está na tela,
          // pra ela não cobrir os últimos resultados.
          pb: panelOpen ? { base: "40", md: "44" } : { base: "10", md: "16" },
          display: "flex",
          flexDir: "column",
        })}
      >
        {/* Hero: sem busca e sem boards, fica centralizado vertical. Com boards
            recentes abaixo, alinha ao topo pra caber a faixa. */}
        <div
          className={css({
            display: "flex",
            flexDir: "column",
            alignItems: "center",
            textAlign: "center",
            w: "full",
            maxW: "560px",
            mx: "auto",
            flex: hasSearched || showRecent ? undefined : "1",
            justifyContent: "center",
            pt: hasSearched ? { base: "4", md: "8" } : showRecent ? { base: "8", md: "14" } : "0",
            pb: hasSearched ? "8" : "0",
          })}
        >
          <div className={css({ mb: hasSearched ? "4" : "3" })}>
            <BrandHeadline size={hasSearched ? "compact" : "hero"} />
          </div>

          {!hasSearched && (
            <p
              className={css({
                fontFamily: "body",
                fontSize: "md",
                color: "gray.11",
                maxW: "44ch",
                mb: "7",
              })}
            >
              Do briefing a um board de referências que o cliente entende sem esforço.
            </p>
          )}

          <SearchField value={query} onSearch={setQuery} />

          {!hasSearched && <SearchSuggestions onPick={setQuery} />}
        </div>

        {showRecent && (
          <RecentBoards boards={recentBoards} totalCount={totalBoardCount} />
        )}

        {hasSearched && (
          <ResultsGrid
            query={debouncedQuery || query.trim()}
            // Debounce ainda pendente (usuário digitando) também conta como carregando.
            status={query.trim() === debouncedQuery ? status : "loading"}
            results={results}
            favoriteIds={favoriteIds}
            onToggleFavorite={toggleFavorite}
          />
        )}
      </main>

      {/* Bottom bar: no fluxo normal monta um board novo; no modo contextual
          (`variant="append"`) conta as escolhidas e soma tudo no board de
          destino de uma vez ("Adicionar +N"). */}
      {activeBoard ? (
        <BoardPanel
          variant="append"
          items={staged}
          saving={addingToBoard}
          onRemove={removeFromStaged}
          onSave={addStagedToBoard}
        />
      ) : (
        <BoardPanel
          name={boardName}
          items={board}
          saving={saving}
          nameSuggestions={nameSuggestions}
          onNameChange={setBoardName}
          onRemove={removeFromBoard}
          onSave={requestSave}
        />
      )}

      <div
        aria-live="polite"
        className={css({
          position: "fixed",
          left: "50%",
          // Sobe acima da bottom bar do board quando ela está na tela.
          bottom: panelOpen ? "6rem" : "6",
          zIndex: "toast",
          transform: "translateX(-50%)",
          pointerEvents: "none",
        })}
      >
        {toast && (
          <span
            className={css({
              display: "inline-block",
              px: "4",
              py: "2.5",
              rounded: "full",
              bg: "textPrimary",
              color: "page",
              fontFamily: "body",
              fontSize: "sm",
              boxShadow: "lg",
            })}
          >
            {toast}
          </span>
        )}
      </div>

      {/* Nome digitado bate com um board que já existe: somar nele ou criar outro? */}
      {nameClash && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Já existe um board com esse nome"
          className={css({
            position: "fixed",
            inset: "0",
            zIndex: "modal",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: "5",
            bg: "black.a7",
          })}
          onClick={() => !saving && setNameClash(null)}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className={css({
              w: "full",
              maxW: "400px",
              display: "flex",
              flexDir: "column",
              gap: "4",
              bg: "surface",
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "border",
              rounded: "2xl",
              boxShadow: "xl",
              p: "6",
            })}
          >
            <div className={css({ display: "flex", flexDir: "column", gap: "1.5" })}>
              <p
                className={css({
                  fontFamily: "display",
                  fontWeight: "400",
                  fontSize: "lg",
                  color: "textPrimary",
                })}
              >
                Já existe um board “{nameClash.name}”
              </p>
              <p className={css({ fontFamily: "body", fontSize: "sm", color: "gray.11" })}>
                Adicionar {board.length} {board.length === 1 ? "imagem" : "imagens"} a esse
                board, ou criar um board novo com o mesmo nome?
              </p>
            </div>
            <div className={css({ display: "flex", flexDir: "column", gap: "2" })}>
              <button
                type="button"
                disabled={saving}
                onClick={() => void saveBoard(nameClash)}
                className={css({
                  h: "44px",
                  px: "5",
                  rounded: "full",
                  border: "none",
                  cursor: "pointer",
                  bg: "ctaPurple",
                  color: "white",
                  fontFamily: "body",
                  fontWeight: "normal",
                  fontSize: "sm",
                  _hover: { bg: "brand.10" },
                  _disabled: { opacity: 0.5, cursor: "not-allowed" },
                  _focusVisible: {
                    outline: "2px solid",
                    outlineColor: "ctaPurple",
                    outlineOffset: "2px",
                  },
                })}
              >
                Adicionar ao board existente
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void saveBoard(null)}
                className={css({
                  h: "44px",
                  px: "5",
                  rounded: "full",
                  borderWidth: "1px",
                  borderStyle: "solid",
                  borderColor: "gray.6",
                  cursor: "pointer",
                  bg: "surface",
                  color: "textPrimary",
                  fontFamily: "body",
                  fontSize: "sm",
                  _hover: { bg: "gray.2" },
                  _disabled: { opacity: 0.5, cursor: "not-allowed" },
                  _focusVisible: {
                    outline: "2px solid",
                    outlineColor: "ctaPurple",
                    outlineOffset: "2px",
                  },
                })}
              >
                Criar um board novo mesmo assim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
