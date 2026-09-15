"use client";
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
import type { Role } from "@/lib/types";
import { useMock } from "./provider";
export function AuthPage({
  register = false,
  initialRole,
}: {
  register?: boolean;
  initialRole?: string;
}) {
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
        <img
          src="/images/shop-3.jpg"
          alt="Warm, welcoming barbershop interior"
        />
        <div>
          <div className="eyebrow">FIND YOUR PEOPLE</div>
          <h2>
            A good haircut
            <br />
            changes your day.
            <br />
            <em>
              A good barber
              <br />
              makes it yours.
            </em>
          </h2>
          <span>CRAFT. CHARACTER. CONNECTION.</span>
        </div>
      </div>
      <div className="auth-content">
        <div className="eyebrow">WELCOME TO CHAIR.</div>
        <h1>
          {register
            ? stage === 0
              ? "Make yourself at home."
              : "Let’s make it yours."
            : "Good to see you."}
        </h1>
        <p>
          {register
            ? "A better connection starts here."
            : "Your next good hair day is waiting."}
        </p>
        {stage === 0 ? (
          <>
            <h3 className="auth-question">How will you use the platform?</h3>
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
                        ? "I’m looking for a barber"
                        : "I am a barber"}
                    </strong>
                    <span>
                      {r === "customer"
                        ? "Find your style. Find your person."
                        : "Show your craft. Build your clientele."}
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
              Continue <ArrowRight size={16} />
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
              notify(
                `Welcome${name ? `, ${name.split(" ")[0]}` : ""}. You’re in the ${role} demo.`,
              );
              router.push(role === "barber" ? "/barber/dashboard" : "/account");
            }}
          >
            {register && (
              <button
                type="button"
                className="link-button auth-role-back"
                onClick={() => setStage(0)}
              >
                <ArrowLeft size={13} /> Joining as a {role} · change
              </button>
            )}
            {!register && (
              <div className="auth-role-tabs">
                <button
                  type="button"
                  className={role === "customer" ? "active" : ""}
                  onClick={() => setRole("customer")}
                >
                  Customer
                </button>
                <button
                  type="button"
                  className={role === "barber" ? "active" : ""}
                  onClick={() => setRole("barber")}
                >
                  Barber
                </button>
              </div>
            )}
            {register && (
              <label className="field">
                Your name
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
              Email address
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
              Demo password
              <input
                required
                type="password"
                autoComplete="off"
                minLength={4}
                placeholder="Any 4+ characters for this preview"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="hint">
                Use a made-up password. It is never stored or sent.
              </span>
            </label>
            <button className="button button-dark button-full" type="submit">
              {register ? "Create demo account" : "Enter the demo"}{" "}
              <ArrowRight size={16} />
            </button>
          </form>
        )}
        <div className="auth-switch">
          {register ? "Already have a chair?" : "New around here?"}{" "}
          <Link href={register ? "/login" : "/register"}>
            {register ? "Sign in" : "Create an account"}
          </Link>
        </div>
        <div className="notice">
          Frontend preview only. There’s no real authentication. This opens a
          sample {role === "barber" ? "Giorgi barber" : "Alex customer"}{" "}
          workspace, with changes saved in this browser.
        </div>
        <Link
          href={role === "barber" ? "/barber/dashboard" : "/account"}
          className="auth-preview-link"
        >
          Explore the demo without signing in <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
