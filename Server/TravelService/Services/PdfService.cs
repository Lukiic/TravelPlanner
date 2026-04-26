using iText.Kernel.Pdf;
using iText.Layout;
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
            using var document = new Document(pdf);

            // Title
            document.Add(new Paragraph(plan.Name)
                .SetFontSize(24)
                .SetBold()
                .SetTextAlignment(TextAlignment.CENTER));

            document.Add(new Paragraph(
                $"{plan.StartDate:dd MMM yyyy}  –  {plan.EndDate:dd MMM yyyy}")
                .SetTextAlignment(TextAlignment.CENTER)
                .SetFontSize(12));

            document.Add(new Paragraph($"Budget: ${plan.Budget:N2}")
                .SetTextAlignment(TextAlignment.CENTER)
                .SetFontSize(12));

            if (!string.IsNullOrWhiteSpace(plan.Notes))
                document.Add(new Paragraph($"Notes: {plan.Notes}").SetFontSize(11));

            document.Add(new Paragraph("\n"));

            // Destinations
            if (plan.Destinations.Any())
            {
                document.Add(new Paragraph("Destinations").SetFontSize(16).SetBold());
                foreach (var d in plan.Destinations.OrderBy(d => d.ArrivalDate))
                {
                    document.Add(new Paragraph(
                        $"• {d.Name} ({d.Location})  |  " +
                        $"{d.ArrivalDate:dd MMM} – {d.DepartureDate:dd MMM}")
                        .SetFontSize(11));
                    if (!string.IsNullOrWhiteSpace(d.Description))
                        document.Add(new Paragraph($"  {d.Description}").SetFontSize(10));
                }
                document.Add(new Paragraph("\n"));
            }

            // Activities
            if (plan.Activities.Any())
            {
                document.Add(new Paragraph("Activities").SetFontSize(16).SetBold());
                var grouped = plan.Activities
                    .OrderBy(a => a.Date)
                    .GroupBy(a => a.Date.Date);

                foreach (var group in grouped)
                {
                    document.Add(new Paragraph(group.Key.ToString("dddd, dd MMM yyyy"))
                        .SetFontSize(13).SetBold());

                    foreach (var a in group)
                    {
                        document.Add(new Paragraph(
                            $"  • [{a.Status}] {a.Name}  {a.Time}" +
                            (string.IsNullOrWhiteSpace(a.Location) ? "" : $"  @{a.Location}") +
                            (a.EstimatedCost > 0 ? $"  (${a.EstimatedCost:N2})" : ""))
                            .SetFontSize(11));
                    }
                }
                document.Add(new Paragraph("\n"));
            }

            // Expenses
            if (plan.Expenses.Any())
            {
                document.Add(new Paragraph("Expenses").SetFontSize(16).SetBold());

                var table = new Table(new float[] { 3, 2, 1, 2 })
                    .UseAllAvailableWidth();
                table.AddHeaderCell("Name");
                table.AddHeaderCell("Category");
                table.AddHeaderCell("Amount");
                table.AddHeaderCell("Date");

                foreach (var e in plan.Expenses.OrderBy(e => e.Date))
                {
                    table.AddCell(e.Name);
                    table.AddCell(e.Category);
                    table.AddCell($"${e.Amount:N2}");
                    table.AddCell(e.Date.ToString("dd MMM yyyy"));
                }
                document.Add(table);

                document.Add(new Paragraph("\nTotals by Category:").SetFontSize(12).SetBold());
                var byCategory = plan.Expenses
                    .GroupBy(e => e.Category)
                    .Select(g => new { Category = g.Key, Total = g.Sum(e => e.Amount) });

                foreach (var c in byCategory)
                    document.Add(new Paragraph($"  {c.Category}: ${c.Total:N2}").SetFontSize(11));

                document.Add(new Paragraph(
                    $"\nTotal Spent: ${plan.Expenses.Sum(e => e.Amount):N2}  |  " +
                    $"Remaining Budget: ${plan.Budget - plan.Expenses.Sum(e => e.Amount):N2}")
                    .SetFontSize(11).SetBold());

                document.Add(new Paragraph("\n"));
            }

            // Checklist
            if (plan.ChecklistItems.Any())
            {
                document.Add(new Paragraph("Checklist").SetFontSize(16).SetBold());
                foreach (var item in plan.ChecklistItems)
                {
                    var tick = item.IsCompleted ? "[x]" : "[ ]";
                    document.Add(new Paragraph($"  {tick}  {item.Name}").SetFontSize(11));
                }
            }

            document.Close();
            return ms.ToArray();
        }
    }
}
