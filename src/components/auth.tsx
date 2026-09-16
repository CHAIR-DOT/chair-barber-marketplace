"use client";
import { publicPath } from "@/lib/public-path";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Scissors,
  UserRound,
} from "lucide-react";
import { customer } from "@/lib/data";
import { useI18n } from "@/i18n/provider";
import type { Role } from "@/lib/types";
import { useMock } from "./provider";
export function AuthPage({
  register = false,
  initialRole,
}: {
  register?: boolean;
  initialRole?: string;
}) {
  const { t: tr } = useI18n();
  const router = useRouter(),
    { update, notify } = useMock(),
    [role, setRole] = useState<Role>(
      initialRole === "barber" ? "barber" : "customer",
    ),
    [stage, setStage] = useState(register && !initialRole ? 0 : 1),
    [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState("");
  return (
    <div className="auth-page">
      <div className="auth-visual">
        <img src={publicPath("/images/shop-3.jpg")} alt={tr("auth.imageAlt")} />
        <div>
          <div className="eyebrow">{tr("auth.visualEyebrow")}</div>
          <h2>
            {tr("auth.visualLine1")}
            <br />
            {tr("auth.visualLine2")}
            <br />
            <em>
              {tr("auth.visualLine3")}
              <br />
              {tr("auth.visualLine4")}
            </em>
          </h2>
          <span>{tr("auth.visualTagline")}</span>
        </div>
      </div>
      <div className="auth-content">
        <div className="eyebrow">{tr("auth.welcome")}</div>
        <h1>
          {register
            ? stage === 0
              ? tr("auth.titleRole")
              : tr("auth.titleRegister")
            : tr("auth.titleLogin")}
        </h1>
        <p>{register ? tr("auth.introRegister") : tr("auth.introLogin")}</p>
        {stage === 0 ? (
          <>
            <h3 className="auth-question">{tr("auth.question")}</h3>
            <div className="role-options">
              {(["customer", "barber"] as Role[]).map((r) => (
                <button
                  className={`selection-option ${role === r ? "selected" : ""}`}
                  key={r}
                  onClick={() => setRole(r)}
                  aria-pressed={role === r}
                >
                  {r === "customer" ? (
                    <UserRound size={25} />
                  ) : (
                    <Scissors size={25} />
                  )}
                  <div>
                    <strong>
                      {r === "customer"
                        ? tr("auth.role.customerTitle")
                        : tr("auth.role.barberTitle")}
                    </strong>
                    <span>
                      {r === "customer"
                        ? tr("auth.role.customerDescription")
                        : tr("auth.role.barberDescription")}
                    </span>
                  </div>
                  <span className="radio-indicator">
                    {role === r && <Check size={12} />}
                  </span>
                </button>
              ))}
            </div>
            <button
              className="button button-dark button-full"
              onClick={() => setStage(1)}
            >
              {tr("auth.continue")}
              <ArrowRight size={16} />
            </button>
          </>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              update({
                user: {
                  ...customer,
                  name:
                    name.trim() ||
                    (role === "barber" ? "Giorgi Kapanadze" : customer.name),
                  email: email || customer.email,
                  role,
                },
              });
              setPassword("");
              notify(`auth.${name ? "welcomeNamed" : "welcome"}.${role}`, {
                name: name.split(" ")[0],
              });
              router.push(role === "barber" ? "/barber/dashboard" : "/account");
            }}
          >
            {register && (
              <button
                type="button"
                className="link-button auth-role-back"
                onClick={() => setStage(0)}
              >
                <ArrowLeft size={13} /> {tr(`auth.joining.${role}`)}
              </button>
            )}
            {!register && (
              <div className="auth-role-tabs">
                <button
                  type="button"
                  className={role === "customer" ? "active" : ""}
                  onClick={() => setRole("customer")}
                >
                  {tr("auth.customer")}
                </button>
                <button
                  type="button"
                  className={role === "barber" ? "active" : ""}
                  onClick={() => setRole("barber")}
                >
                  {tr("auth.barber")}
                </button>
              </div>
            )}
            {register && (
              <label className="field">
                {tr("auth.name")}
                <input
                  required
                  autoComplete="name"
                  placeholder="Alex Chikovani"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
            )}
            <label className="field">
              {tr("auth.email")}
              <input
                required
                type="email"
                autoComplete="off"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="field">
              {tr("auth.password")}
              <input
                required
                type="password"
                autoComplete="off"
                minLength={4}
                placeholder={tr("auth.passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="hint">{tr("auth.passwordHint")}</span>
            </label>
            <button className="button button-dark button-full" type="submit">
              {register ? tr("auth.createDemo") : tr("auth.enterDemo")}{" "}
              <ArrowRight size={16} />
            </button>
          </form>
        )}
        <div className="auth-switch">
          {register ? tr("auth.existingAccount") : tr("auth.newAccount")}{" "}
          <Link href={register ? "/login" : "/register"}>
            {register ? tr("auth.signIn") : tr("auth.createAccount")}
          </Link>
        </div>
        <div className="notice">{tr(`auth.notice.${role}`)}</div>
        <Link
          href={role === "barber" ? "/barber/dashboard" : "/account"}
          className="auth-preview-link"
        >
          {tr("auth.exploreDemo")}
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
