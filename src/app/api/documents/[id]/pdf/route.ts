import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminStorage } from "@/lib/firebase/admin";
import { renderInvoiceHtml } from "@/lib/pdf/template";
import { Document } from "@/lib/types";
import puppeteer from "puppeteer";
import { computeFinancialYear } from "@/lib/utils/finance";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const docSnap = await adminDb.collection("documents").doc(params.id).get();
  if (!docSnap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const doc = docSnap.data() as Document;
  const html = renderInvoiceHtml(doc);

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html);
  const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
  await browser.close();

  const version = (doc.pdf?.version || 0) + 1;
  const fy = doc.financialYear || computeFinancialYear(new Date(doc.issueDate));
  const path = `pdfs/${doc.type}/${fy}/${doc.number || doc.id}_v${version}.pdf`;
  const bucket = adminStorage.bucket();
  const file = bucket.file(path);
  await file.save(pdfBuffer, { contentType: "application/pdf" });
  const [url] = await file.getSignedUrl({ action: "read", expires: Date.now() + 1000 * 60 * 60 * 24 * 7 });

  await adminDb.collection("documents").doc(params.id).update({
    pdf: { url, path, generatedAt: new Date().toISOString(), version },
  });
  await adminDb.collection("auditLogs").add({
    documentId: params.id,
    action: "PDF_GENERATE",
    createdAt: new Date().toISOString(),
  });

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=invoice_${doc.number || doc.id}.pdf`,
    },
  });
}
