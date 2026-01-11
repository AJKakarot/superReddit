import jsPDF from "jspdf";
import { Post } from "@/app/posts/[id]/page"; // Assuming type export from the page

// A helper function to add a styled header
const addHeader = (doc: jsPDF, clientName: string) => {
  doc.setFillColor("#2d3748"); // slate-800
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 25, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor("#ffffff");
  doc.text("Post Performance Report", 14, 16);

  doc.setFontSize(10);
  doc.setTextColor("#cbd5e0"); // slate-400
  doc.text(clientName, doc.internal.pageSize.getWidth() - 14, 16, {
    align: "right",
  });
};

// A helper function to add a section title
const addSectionTitle = (doc: jsPDF, title: string, y: number) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor("#2d3748"); // slate-800
  doc.text(title, 14, y);
  doc.setDrawColor("#e2e8f0"); // slate-200
  doc.line(14, y + 2, doc.internal.pageSize.getWidth() - 14, y + 2);
  return y + 10;
};

// A helper to add key-value pairs
const addInfoPair = (doc: jsPDF, key: string, value: string, y: number) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor("#4a5568"); // slate-700
    doc.text(key, 14, y);

    doc.setFont("helvetica", "normal");
    doc.setTextColor("#718096"); // slate-500
    doc.text(value, 50, y);
    return y + 6;
};

export const generatePostReport = async (
  post: Post,
  chartElement: HTMLElement | null,
  clientName: string,
) => {
  if (!chartElement) {
    alert("Chart element not found. Cannot generate report.");
    return;
  }
  
  // Use html2canvas to render the chart as an image
  const { default: html2canvas } = await import("html2canvas");
  const canvas = await html2canvas(chartElement, {
    backgroundColor: "#ffffff", // Ensure background is white
    scale: 2 // Increase resolution
  });
  const chartImage = canvas.toDataURL("image/png");

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  addHeader(doc, clientName);
  
  let y = 40; // Initial y position after header

  // --- Post Summary Section ---
  y = addSectionTitle(doc, "Post Summary", y);
  y = addInfoPair(doc, "Title:", post.title, y);
  y = addInfoPair(doc, "Subreddit:", `r/${post.subreddit}`, y);
  y = addInfoPair(doc, "Posted On:", new Date(post.posted_at!).toLocaleString(), y);
  y = addInfoPair(doc, "Final Upvotes:", post.current_upvotes?.toString() ?? 'N/A', y);
  y = addInfoPair(doc, "Final Comments:", post.current_comments?.toString() ?? 'N/A', y);
  y += 5;

  // --- Performance Chart Section ---
  y = addSectionTitle(doc, "Engagement Over Time", y);
  // A4 width is 210mm, with 14mm margins on each side = 182mm available
  const imgWidth = 182;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  doc.addImage(chartImage, "PNG", 14, y, imgWidth, imgHeight);
  y += imgHeight + 10;
  
  // --- Post Content Section ---
  y = addSectionTitle(doc, "Post Content", y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor("#4a5568"); // slate-700
  const splitBody = doc.splitTextToSize(post.body, 182);
  
  // Check if content will overflow and add new page if needed
  if (y + (splitBody.length * 5) > 280) {
      doc.addPage();
      y = 20; // Reset y on new page
  }
  
  doc.text(splitBody, 14, y);
  
  // Save the PDF
  doc.save(`report_${post.subreddit}_${post.id.slice(0, 8)}.pdf`);
};

// Add Post interface here if not exported from page
declare module "@/app/posts/[id]/page" {
    interface Post {
        id: string;
        title: string;
        body: string;
        subreddit: string;
        status: "Draft" | "Scheduled" | "Posted" | "Error";
        posted_at?: string;
        current_upvotes?: number;
        current_comments?: number;
    }
} 