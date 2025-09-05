.bg-grainy-gradient {
  background:
    radial-gradient(60rem 30rem at 10% 0%, rgba(140, 70, 255, 0.25), transparent 60%),
    radial-gradient(40rem 20rem at 85% 20%, rgba(50, 120, 255, 0.18), transparent 60%),
    radial-gradient(30rem 15rem at 50% 90%, rgba(20, 30, 90, 0.25), transparent 60%),
    linear-gradient(135deg, var(--c0) 0%, var(--c1) 35%, var(--c2) 70%, var(--c3) 100%);
  position: relative;
  overflow: hidden;
}

.bg-grainy-gradient::before {
  content: "";
  position: absolute;
  inset: -2rem;
  pointer-events: none;
  background: radial-gradient(120% 120% at 50% 60%,
    rgba(0,0,0,0) 60%,
    rgba(0,0,0,.25) 100%);
  filter: blur(40px); /* <<< BLUR aplicado aqui */
}