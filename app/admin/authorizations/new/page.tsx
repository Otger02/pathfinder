import { createAuthorization } from "../actions";
import AuthorizationForm from "../AuthorizationForm";

export default function NewAuthorizationPage() {
  return (
    <div>
      <h1 style={{ margin: "0 0 20px", fontSize: 22 }}>Nova autorització</h1>
      <AuthorizationForm action={createAuthorization} />
    </div>
  );
}
