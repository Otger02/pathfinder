import { createResource } from "../actions";
import ResourceForm from "../ResourceForm";

export default function NewResourcePage() {
  return (
    <div>
      <h1 style={{ margin: "0 0 20px", fontSize: 22 }}>Nou recurs</h1>
      <ResourceForm action={createResource} />
    </div>
  );
}
