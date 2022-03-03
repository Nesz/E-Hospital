using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace DicomViewer.Migrations
{
    public partial class InitialCreate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DicomMetas",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PatientId = table.Column<long>(type: "bigint", nullable: false),
                    StudyId = table.Column<string>(type: "text", nullable: true),
                    SeriesId = table.Column<string>(type: "text", nullable: true),
                    InstanceId = table.Column<int>(type: "integer", nullable: false),
                    MongoId = table.Column<string>(type: "text", nullable: true),
                    StudyDescription = table.Column<string>(type: "text", nullable: true),
                    Modality = table.Column<string>(type: "text", nullable: true),
                    StudyDate = table.Column<DateTime>(type: "timestamp", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DicomMetas", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DicomMetas");
        }
    }
}
