"use client";

import { type FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { css } from "styled-system/css";
import { iconDefaults } from "@/components/Icon";
import { createClient } from "@/lib/supabase/client";

/**
 * Formulário da tela de entrada (/login).
 *
 * Duas colunas separadas por "/" : à esquerda email + senha + ação; à direita,
 * "Entrar com o Google" (desabilitado, "Em breve" — OAuth fica pro backlog,
 * decisão 03). Abaixo, o toggle login/cadastro e o link "Esqueci a senha".
 *
 * Fase 3: autenticação real via Supabase Auth. Sem fluxo de cadastro desenhado,
 * o mesmo formulário faz as duas coisas — um toggle explícito troca entre
 * `signInWithPassword` e `signUp` sem redesenhar a tela.
 */

const ERRO_CREDENCIAIS = "Email ou senha não bateram. Tenta de novo.";
const ERRO_GENERICO = "Não deu pra entrar agora. Tenta de novo.";
const ERRO_SENHA_CURTA = "Senha muito curta. Usa ao menos 6 caracteres.";
const ERRO_EMAIL_EXISTENTE = "Esse email já tem conta. Faz login.";
const ERRO_RATE_LIMIT = "Muitas tentativas agora. Espera um minuto e tenta de novo.";
const ERRO_EMAIL_INVALIDO = "Esse email não passou na validação do Supabase. Usa outro.";
const AVISO_CONFIRMA_EMAIL = "Conta criada. Confirma pelo link no seu email pra entrar.";

/** Erros de rate limit do Supabase Auth — status 429, várias mensagens possíveis. */
function isRateLimit(error: { status?: number; message: string }) {
  return error.status === 429 || /rate limit|too many requests|over_email_send_rate/i.test(error.message);
}

const field = css({
  h: "52px",
  w: "full",
  rounded: "full",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "gray.6",
  bg: "surface",
  px: "6",
  fontFamily: "body",
  fontSize: "sm",
  color: "textPrimary",
  transition: "border-color 0.15s ease",
  _placeholder: { color: "gray.9" },
  _focusVisible: { outline: "none", borderColor: "gray.9" },
  '&[aria-invalid="true"]': { borderColor: "error" },
});

const pillButton = css({
  h: "52px",
  w: "full",
  rounded: "full",
  cursor: "pointer",
  fontFamily: "body",
  display: "flex",
  alignItems: "center",
  transition: "background-color 0.15s ease, border-color 0.15s ease",
  _disabled: { opacity: 0.6, cursor: "not-allowed" },
});

const srOnly = css({
  srOnly: true,
});

type Mode = "login" | "signup";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Só caminho interno — barra `?next=//evil.com` e URLs absolutas (open redirect).
  const nextParam = searchParams.get("next");
  const next = nextParam && /^\/(?!\/)/.test(nextParam) ? nextParam : "/";

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);
    setAviso(null);

    if (!email.trim() || !senha.trim()) {
      setErro(ERRO_CREDENCIAIS);
      return;
    }

    setCarregando(true);
    const supabase = createClient();

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: senha,
        });

        if (error) {
          if (isRateLimit(error)) {
            setErro(ERRO_RATE_LIMIT);
          } else if (/already registered|already exists/i.test(error.message)) {
            setErro(ERRO_EMAIL_EXISTENTE);
          } else if (/at least 6|password should be/i.test(error.message)) {
            setErro(ERRO_SENHA_CURTA);
          } else if (/email address.*invalid|invalid.*email/i.test(error.message)) {
            setErro(ERRO_EMAIL_INVALIDO);
          } else {
            setErro(ERRO_GENERICO);
          }
          return;
        }

        if (data.session) {
          redirectIn();
          return;
        }

        // Sem sessão = projeto Supabase com "Confirm email" ligado.
        setAviso(AVISO_CONFIRMA_EMAIL);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      });

      if (error) {
        if (isRateLimit(error)) {
          setErro(ERRO_RATE_LIMIT);
        } else if (/email not confirmed/i.test(error.message)) {
          setErro(AVISO_CONFIRMA_EMAIL);
        } else {
          setErro(/invalid login credentials/i.test(error.message) ? ERRO_CREDENCIAIS : ERRO_GENERICO);
        }
        return;
      }

      redirectIn();
    } finally {
      setCarregando(false);
    }
  }

  function redirectIn() {
    router.replace(next);
    router.refresh();
  }

  function toggleMode() {
    setMode((m) => (m === "login" ? "signup" : "login"));
    setErro(null);
    setAviso(null);
  }

  const acaoLabel = mode === "login" ? "Entrar" : "Criar conta";

  return (
    <div className={css({ w: "full", maxW: "760px" })}>
      {erro && (
        <div
          role="alert"
          className={css({
            w: "full",
            maxW: "480px",
            mx: "auto",
            mb: "5",
            display: "flex",
            gap: "2",
            textAlign: "left",
            bg: "red.a3",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "red.a6",
            rounded: "2xl",
            px: "4",
            py: "3",
          })}
        >
          <span
            className={css({
              fontFamily: "body",
              fontSize: "xs",
              lineHeight: "1.4",
              color: "red.11",
            })}
          >
            {erro}
          </span>
        </div>
      )}

      {aviso && (
        <div
          role="status"
          className={css({
            w: "full",
            maxW: "480px",
            mx: "auto",
            mb: "5",
            textAlign: "left",
            bg: "gray.2",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "gray.6",
            rounded: "2xl",
            px: "4",
            py: "3",
          })}
        >
          <span
            className={css({
              fontFamily: "body",
              fontSize: "xs",
              lineHeight: "1.4",
              color: "gray.11",
            })}
          >
            {aviso}
          </span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        className={css({
          w: "full",
          display: "flex",
          flexDir: { base: "column", md: "row" },
          alignItems: { md: "stretch" },
          gap: { base: "4", md: "0" },
          textAlign: "left",
        })}
      >
        {/* Coluna esquerda: email -> senha -> ação */}
        <div
          className={css({
            flex: "1",
            display: "flex",
            flexDir: "column",
            justifyContent: "center",
            gap: "3.5",
            pr: { md: "6" },
          })}
        >
          <label className={srOnly} htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={erro ? "true" : undefined}
            className={field}
          />

          <label className={srOnly} htmlFor="login-senha">
            Senha
          </label>
          <div className={css({ position: "relative" })}>
            <input
              id="login-senha"
              name="senha"
              type={senhaVisivel ? "text" : "password"}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              aria-invalid={erro ? "true" : undefined}
              className={`${field} ${css({ pr: "14" })}`}
            />
            <button
              type="button"
              onClick={() => setSenhaVisivel((v) => !v)}
              aria-label={senhaVisivel ? "Esconder senha" : "Mostrar senha"}
              aria-pressed={senhaVisivel}
              className={css({
                position: "absolute",
                top: "50%",
                right: "4",
                transform: "translateY(-50%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                w: "9",
                h: "9",
                rounded: "full",
                border: "none",
                cursor: "pointer",
                bg: "transparent",
                color: "gray.9",
                transition: "color 0.15s ease",
                _hover: { color: "textPrimary" },
                _focusVisible: {
                  outline: "2px solid",
                  outlineColor: "ctaPurple",
                  outlineOffset: "2px",
                },
              })}
            >
              {senhaVisivel ? (
                <EyeSlash {...iconDefaults} size={18} aria-hidden />
              ) : (
                <Eye {...iconDefaults} size={18} aria-hidden />
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={carregando}
            className={`${pillButton} ${css({
              border: "none",
              bg: "ctaPurple",
              color: "white",
              fontWeight: "semibold",
              fontSize: "md",
              justifyContent: "space-between",
              pl: "6",
              pr: "1",
              py: "1",
              _hover: { bg: "brand.10" },
            })}`}
          >
            <span>{carregando ? "Um instante" : acaoLabel}</span>
            <span
              className={css({
                w: "44px",
                h: "44px",
                rounded: "full",
                bg: "surface",
                color: "ctaPurple",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: "0",
              })}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </button>
        </div>

        {/* Divisor "/" — só no layout de duas colunas */}
        <div
          className={css({
            flexShrink: "0",
            display: { base: "none", md: "flex" },
            alignItems: "center",
            justifyContent: "center",
            px: "2",
          })}
          aria-hidden="true"
        >
          <span
            className={css({ fontFamily: "serif", fontSize: "3xl", color: "gray.9" })}
          >
            /
          </span>
        </div>

        {/* Coluna direita: Entrar com o Google (Em breve) */}
        <div
          className={css({
            flex: "1",
            display: "flex",
            flexDir: "column",
            justifyContent: "center",
            gap: "1.5",
            pl: { md: "6" },
          })}
        >
          <button
            type="button"
            disabled
            aria-disabled="true"
            title="Em breve"
            className={`${pillButton} ${css({
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "gray.6",
              bg: "surface",
              color: "textPrimary",
              fontWeight: "medium",
              fontSize: "sm",
              justifyContent: "center",
              gap: "2.5",
            })}`}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
              />
              <path
                fill="#FBBC05"
                d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
              />
              <path
                fill="#EA4335"
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
              />
            </svg>
            Entrar com o Google
          </button>
          <span
            className={css({
              fontFamily: "body",
              fontSize: "xs",
              color: "gray.9",
              textAlign: "center",
            })}
          >
            Em breve
          </span>
        </div>
      </form>

      <div className={css({ textAlign: "center", mt: "7", display: "flex", flexDir: "column", gap: "2" })}>
        <button
          type="button"
          onClick={toggleMode}
          className={css({
            display: "inline-block",
            border: "none",
            bg: "transparent",
            cursor: "pointer",
            fontFamily: "body",
            fontWeight: "medium",
            fontSize: "sm",
            color: "ctaPurple",
            _hover: { textDecoration: "underline" },
          })}
        >
          {mode === "login" ? "Não tem conta? Criar conta" : "Já tem conta? Entrar"}
        </button>

        {/* Recuperação de senha real fica pro backlog — segue só link. */}
        <a
          href="#"
          className={css({
            display: "inline-block",
            fontFamily: "body",
            fontWeight: "medium",
            fontSize: "sm",
            color: "gray.9",
            textDecoration: "none",
            _hover: { textDecoration: "underline" },
          })}
        >
          Esqueci a senha
        </a>
      </div>
    </div>
  );
}
