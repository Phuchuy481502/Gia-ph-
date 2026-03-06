import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  try {
    const schemaPath = path.join(process.cwd(), "docs", "schema.sql");
    const content = await fs.readFile(schemaPath, "utf-8");
    return new Response(content, {
      headers: {
        "Content-Type": "application/sql; charset=utf-8",
        "Content-Disposition": 'attachment; filename="giapha-os-schema.sql"',
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response("-- Error: schema.sql not found", { status: 404 });
  }
}
