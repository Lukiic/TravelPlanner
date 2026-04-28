using Microsoft.EntityFrameworkCore;
using TravelService.Models;

namespace TravelService.Data
{
    public class TravelDbContext : DbContext
    {
        public TravelDbContext(DbContextOptions<TravelDbContext> options) : base(options) { }

        public DbSet<TravelPlan> TravelPlans => Set<TravelPlan>();
        public DbSet<Destination> Destinations => Set<Destination>();
        public DbSet<Activity> Activities => Set<Activity>();
        public DbSet<Expense> Expenses => Set<Expense>();
        public DbSet<ChecklistItem> ChecklistItems => Set<ChecklistItem>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<TravelPlan>(entity =>
            {
                entity.HasKey(tp => tp.Id);
                entity.Property(tp => tp.Name).IsRequired().HasMaxLength(255);
                entity.Property(tp => tp.Budget).HasColumnType("decimal(18,2)");
            });

            modelBuilder.Entity<Destination>(entity =>
            {
                entity.HasKey(d => d.Id);
                entity.Property(d => d.Name).IsRequired().HasMaxLength(255);
                entity.Property(d => d.Location).IsRequired().HasMaxLength(255);
                entity.HasOne(d => d.TravelPlan)
                      .WithMany(tp => tp.Destinations)
                      .HasForeignKey(d => d.TravelPlanId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Activity>(entity =>
            {
                entity.HasKey(a => a.Id);
                entity.Property(a => a.Name).IsRequired().HasMaxLength(255);
                entity.Property(a => a.Status).HasMaxLength(50).HasDefaultValue("Planned");
                entity.Property(a => a.EstimatedCost).HasColumnType("decimal(18,2)");
                entity.HasOne(a => a.TravelPlan)
                      .WithMany(tp => tp.Activities)
                      .HasForeignKey(a => a.TravelPlanId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Expense>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Category).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
                entity.HasOne(e => e.TravelPlan)
                      .WithMany(tp => tp.Expenses)
                      .HasForeignKey(e => e.TravelPlanId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<ChecklistItem>(entity =>
            {
                entity.HasKey(c => c.Id);
                entity.Property(c => c.Name).IsRequired().HasMaxLength(255);
                entity.HasOne(c => c.TravelPlan)
                      .WithMany(tp => tp.ChecklistItems)
                      .HasForeignKey(c => c.TravelPlanId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
