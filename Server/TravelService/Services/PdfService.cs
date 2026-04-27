using iText.Kernel.Events;
using iText.Kernel.Font;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas;
using iText.Layout;
using iText.Layout.Borders;
using iText.Layout.Element;
using iText.Layout.Properties;
using TravelService.Models;

namespace TravelService.Services
{
    public class PdfService
    {
        public byte[] GenerateTravelPlanPdf(TravelPlan plan)
        {
            using var ms = new MemoryStream();
            using var writer = new PdfWriter(ms);
            using var pdf = new PdfDocument(writer);

            pdf.AddEventHandler(PdfDocumentEvent.END_PAGE, new PageNumberHandler());

            using var document = new Document(pdf);
            document.SetMargins(60, 50, 60, 50);

            // Header
            document.Add(new Paragraph(plan.Name)
                .SetFontSize(28)
                .SetBold()
                .SetTextAlignment(TextAlignment.CENTER)
                .SetMarginBottom(4));

            document.Add(new Paragraph(
                    $"{plan.StartDate:dd MMM yyyy}  –  {plan.EndDate:dd MMM yyyy}")
                .SetFontSize(13)
                .SetTextAlignment(TextAlignment.CENTER)
                .SetFontColor(new iText.Kernel.Colors.DeviceGray(0.4f))
                .SetMarginBottom(2));

            document.Add(new Paragraph($"Total Budget:  ${plan.Budget:N2}")
                .SetFontSize(13)
                .SetTextAlignment(TextAlignment.CENTER)
                .SetMarginBottom(16));

            document.Add(MakeRule());
            document.Add(new Paragraph("\n").SetFontSize(4));

            // Notes
            if (!string.IsNullOrWhiteSpace(plan.Notes))
            {
                document.Add(SectionHeader("Notes"));
                document.Add(new Paragraph(plan.Notes)
                    .SetFontSize(10)
                    .SetItalic()
                    .SetMarginLeft(12)
                    .SetMarginBottom(14));
            }

            // Destinations
            if (plan.Destinations.Any())
            {
                document.Add(SectionHeader("Destinations"));

                foreach (var d in plan.Destinations.OrderBy(d => d.ArrivalDate))
                {
                    document.Add(new Paragraph()
                        .Add(new Text($"{d.Name}").SetBold())
                        .Add(new Text($"  ({d.Location})"))
                        .SetFontSize(11)
                        .SetMarginBottom(1)
                        .SetMarginLeft(8));

                    document.Add(new Paragraph(
                            $"{d.ArrivalDate:dd MMM yyyy}  →  {d.DepartureDate:dd MMM yyyy}")
                        .SetFontSize(10)
                        .SetFontColor(new iText.Kernel.Colors.DeviceGray(0.45f))
                        .SetMarginLeft(16)
                        .SetMarginBottom(d.Description.Length > 0 ? 1 : 8));

                    if (!string.IsNullOrWhiteSpace(d.Description))
                        document.Add(new Paragraph(d.Description)
                            .SetFontSize(10)
                            .SetItalic()
                            .SetMarginLeft(16)
                            .SetMarginBottom(8));
                }
                document.Add(new Paragraph("\n").SetFontSize(4));
            }

            // Activities
            if (plan.Activities.Any())
            {
                document.Add(SectionHeader("Activities"));

                var grouped = plan.Activities
                    .OrderBy(a => a.Date).ThenBy(a => a.Time)
                    .GroupBy(a => a.Date.Date);

                foreach (var group in grouped)
                {
                    document.Add(new Paragraph(group.Key.ToString("dddd, dd MMM yyyy"))
                        .SetFontSize(11)
                        .SetBold()
                        .SetFontColor(new iText.Kernel.Colors.DeviceGray(0.25f))
                        .SetMarginLeft(4)
                        .SetMarginTop(6)
                        .SetMarginBottom(3));

                    foreach (var a in group)
                    {
                        var line = new Paragraph()
                            .SetMarginLeft(14)
                            .SetMarginBottom(3)
                            .SetFontSize(10);

                        // Status indicator prefix
                        var statusPrefix = a.Status switch
                        {
                            "Completed" => "[x] ",
                            "Cancelled" => "[-] ",
                            "Reserved" => "[R] ",
                            _ => "[ ] ",
                        };
                        line.Add(new Text(statusPrefix)
                            .SetFontColor(new iText.Kernel.Colors.DeviceGray(0.5f)));
                        line.Add(new Text(a.Name).SetBold());

                        if (!string.IsNullOrWhiteSpace(a.Time))
                            line.Add(new Text($"  {a.Time.Substring(0, Math.Min(5, a.Time.Length))}")
                                .SetFontColor(new iText.Kernel.Colors.DeviceGray(0.45f)));

                        if (!string.IsNullOrWhiteSpace(a.Location))
                            line.Add(new Text($"  @{a.Location}")
                                .SetItalic()
                                .SetFontColor(new iText.Kernel.Colors.DeviceGray(0.4f)));

                        if (a.EstimatedCost > 0)
                            line.Add(new Text($"  ~${a.EstimatedCost:N2}")
                                .SetFontColor(new iText.Kernel.Colors.DeviceGray(0.45f)));

                        document.Add(line);
                    }
                }
                document.Add(new Paragraph("\n").SetFontSize(4));
            }

            // Expenses
            if (plan.Expenses.Any())
            {
                document.Add(SectionHeader("Expenses"));

                // Table with borders
                var table = new Table(new float[] { 3.5f, 2f, 1.5f, 2f })
                    .UseAllAvailableWidth()
                    .SetMarginBottom(8);

                // Header row
                foreach (var h in new[] { "Name", "Category", "Amount", "Date" })
                {
                    table.AddHeaderCell(new Cell()
                        .SetBackgroundColor(new iText.Kernel.Colors.DeviceGray(0.88f))
                        .SetBorder(new SolidBorder(new iText.Kernel.Colors.DeviceGray(0.7f), 0.5f))
                        .Add(new Paragraph(h)
                            .SetFontSize(10)
                            .SetBold()
                            .SetTextAlignment(TextAlignment.LEFT)));
                }

                bool alt = false;
                foreach (var e in plan.Expenses.OrderBy(e => e.Date))
                {
                    var rowBg = alt
                        ? new iText.Kernel.Colors.DeviceGray(0.97f)
                        : iText.Kernel.Colors.ColorConstants.WHITE;
                    var cellBorder = new SolidBorder(new iText.Kernel.Colors.DeviceGray(0.8f), 0.5f);

                    table.AddCell(StyledCell(e.Name, rowBg, cellBorder, false));
                    table.AddCell(StyledCell(e.Category, rowBg, cellBorder, false));
                    table.AddCell(StyledCell($"${e.Amount:N2}", rowBg, cellBorder, true));
                    table.AddCell(StyledCell(e.Date.ToString("dd MMM yyyy"), rowBg, cellBorder, false));
                    alt = !alt;
                }

                document.Add(table);

                // Summary
                var totalExpenses = plan.Expenses.Sum(e => e.Amount);
                var activityEstimates = plan.Activities
                    .Where(a => a.EstimatedCost > 0 && a.Status != "Cancelled")
                    .Sum(a => a.EstimatedCost);
                var grandTotal = totalExpenses + activityEstimates;

                document.Add(new Paragraph()
                    .Add(new Text("Expenses total:  ").SetBold())
                    .Add(new Text($"${totalExpenses:N2}"))
                    .SetFontSize(10)
                    .SetTextAlignment(TextAlignment.RIGHT));

                if (activityEstimates > 0)
                {
                    document.Add(new Paragraph()
                        .Add(new Text("Activity estimates:  ").SetBold())
                        .Add(new Text($"${activityEstimates:N2}"))
                        .SetFontSize(10)
                        .SetTextAlignment(TextAlignment.RIGHT));
                }

                document.Add(new Paragraph()
                    .Add(new Text("Total spent:  ").SetBold())
                    .Add(new Text($"${grandTotal:N2}"))
                    .SetFontSize(11)
                    .SetTextAlignment(TextAlignment.RIGHT));

                document.Add(new Paragraph()
                    .Add(new Text("Remaining budget:  ").SetBold())
                    .Add(new Text($"${plan.Budget - grandTotal:N2}"))
                    .SetFontSize(11)
                    .SetTextAlignment(TextAlignment.RIGHT)
                    .SetMarginBottom(8));

                // Categories
                document.Add(new Paragraph("By category:")
                    .SetFontSize(10)
                    .SetBold()
                    .SetMarginBottom(2));

                var byCategory = plan.Expenses
                    .GroupBy(e => e.Category)
                    .Select(g => new { Category = g.Key, Total = g.Sum(e => e.Amount) })
                    .OrderByDescending(x => x.Total);

                foreach (var c in byCategory)
                    document.Add(new Paragraph($"  {c.Category}:  ${c.Total:N2}")
                        .SetFontSize(10)
                        .SetMarginBottom(1));

                if (activityEstimates > 0)
                    document.Add(new Paragraph($"  Activities (estimated):  ${activityEstimates:N2}")
                        .SetFontSize(10)
                        .SetMarginBottom(1));

                document.Add(new Paragraph("\n").SetFontSize(4));
            }

            // Checklist
            if (plan.ChecklistItems.Any())
            {
                document.Add(SectionHeader("Checklist"));

                var completed = plan.ChecklistItems.Count(i => i.IsCompleted);
                document.Add(new Paragraph($"{completed} of {plan.ChecklistItems.Count} items completed")
                    .SetFontSize(10)
                    .SetFontColor(new iText.Kernel.Colors.DeviceGray(0.45f))
                    .SetMarginBottom(6));

                foreach (var item in plan.ChecklistItems.OrderBy(i => i.IsCompleted))
                {
                    var tick = item.IsCompleted ? "[x]" : "[ ]";
                    var p = new Paragraph($"  {tick}  {item.Name}")
                        .SetFontSize(10)
                        .SetMarginBottom(3)
                        .SetMarginLeft(8);

                    if (item.IsCompleted)
                        p.SetFontColor(new iText.Kernel.Colors.DeviceGray(0.5f));

                    document.Add(p);
                }
            }

            document.Close();
            return ms.ToArray();
        }

        // Helpers

        private static Paragraph SectionHeader(string title)
        {
            return new Paragraph(title.ToUpperInvariant())
                .SetFontSize(9)
                .SetBold()
                .SetFontColor(new iText.Kernel.Colors.DeviceGray(0.35f))
                .SetCharacterSpacing(1.2f)
                .SetMarginBottom(5)
                .SetMarginTop(4)
                .SetBorderBottom(new SolidBorder(new iText.Kernel.Colors.DeviceGray(0.7f), 0.5f))
                .SetPaddingBottom(4);
        }

        private static LineSeparator MakeRule()
        {
            return new LineSeparator(new iText.Kernel.Pdf.Canvas.Draw.SolidLine(0.5f))
                .SetMarginTop(4)
                .SetMarginBottom(4);
        }

        private static Cell StyledCell(
            string text,
            iText.Kernel.Colors.Color bg,
            Border border,
            bool rightAlign)
        {
            return new Cell()
                .SetBackgroundColor(bg)
                .SetBorder(border)
                .Add(new Paragraph(text)
                    .SetFontSize(10)
                    .SetTextAlignment(rightAlign
                        ? TextAlignment.RIGHT
                        : TextAlignment.LEFT));
        }
    }

    // Page number at the bottom of each page
    internal class PageNumberHandler : IEventHandler
    {
        public void HandleEvent(Event @event)
        {
            var docEvent = (PdfDocumentEvent)@event;
            var pdf = docEvent.GetDocument();
            var page = docEvent.GetPage();
            var pageNum = pdf.GetPageNumber(page);
            var pageCount = pdf.GetNumberOfPages();

            var pdfPage = page;
            var canvas = new PdfCanvas(pdfPage);
            var pageSize = pdfPage.GetPageSize();

            canvas.BeginText()
                .SetFontAndSize(
                    PdfFontFactory.CreateFont(iText.IO.Font.Constants.StandardFonts.HELVETICA),
                    8)
                .MoveText(pageSize.GetWidth() / 2 - 20, 30)
                .ShowText($"Page {pageNum} of {pageCount}")
                .EndText()
                .Release();
        }
    }
}
