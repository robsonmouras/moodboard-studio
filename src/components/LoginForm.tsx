"use client";

import { type FormEvent, useState } from "react";
import { css } from "styled-system/css";

/**
 * Formulário da tela de entrada (/login) — decisão de design v3.
 *
 * Duas colunas separadas por "/" : à esquerda email + senha + "Entrar";
 * à direita, "Entrar com o Google". Abaixo, o link "Esqueci a senha".
 * Tudo em pill (totalmente arredondado).
 *
 * Estado atual: apenas visual + validação local de campos vazios. A autenticação
 * real (Supabase Auth) entra na Fase 3 — ver TODOs abaixo. Nenhum valor de cor/fonte
 * hardcoded: tudo por tokens do tema (panda.config.ts).
 */

const ERRO_CREDENCIAIS = "Email ou senha não bateram. Tenta de novo.";

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

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // TODO(Fase 3): trocar a validação local pela chamada de Supabase Auth
    // (signInWithPassword) e mapear o retorno de erro para ERRO_CREDENCIAIS.
    if (!email.trim() || !senha.trim()) {
      setErro(ERRO_CREDENCIAIS);
      return;
    }
    setErro(null);
  }

  function handleGoogle() {
    // TODO(Fase 3): Supabase Auth — signInWithOAuth({ provider: "google" }).
  }

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
        {/* Coluna esquerda: email -> senha -> Entrar */}
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
          <input
            id="login-senha"
            name="senha"
            type="password"
            autoComplete="current-password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            aria-invalid={erro ? "true" : undefined}
            className={field}
          />

          <button
            type="submit"
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
            <span>Entrar</span>
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

        {/* Coluna direita: Entrar com o Google */}
        <div
          className={css({
            flex: "1",
            display: "flex",
            flexDir: "column",
            justifyContent: "center",
            pl: { md: "6" },
          })}
        >
          <button
            type="button"
            onClick={handleGoogle}
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
              _hover: { bg: "gray.2" },
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
        </div>
      </form>

      <div className={css({ textAlign: "center" })}>
        {/* TODO(Fase 3): rota real de recuperação de senha. */}
        <a
          href="#"
          className={css({
            display: "inline-block",
            mt: "7",
            fontFamily: "body",
            fontWeight: "medium",
            fontSize: "sm",
            color: "ctaPurple",
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
