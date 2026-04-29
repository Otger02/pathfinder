import { readFileSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";

export async function GET() {
  const filePath = join(process.cwd(), "data", "decision-tree.json");
  const raw = readFileSync(filePath, "utf-8");
  const tree = JSON.parse(raw);
  return NextResponse.json(tree);
}
