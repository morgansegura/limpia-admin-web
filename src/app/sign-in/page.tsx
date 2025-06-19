import { SignIn } from "@clerk/nextjs";

import "./sign-in.css";

export default function SignInPage() {
  return (
    <div className="sign-in">
      <SignIn />
    </div>
  );
}
