using Microsoft.EntityFrameworkCore.Migrations;

namespace DicomViewer3.Migrations
{
    public partial class InstanceMetaInPostgres : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MongoId",
                table: "Instances");

            migrationBuilder.AddColumn<string>(
                name: "DicomMeta",
                table: "Instances",
                type: "jsonb",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DicomMeta",
                table: "Instances");

            migrationBuilder.AddColumn<string>(
                name: "MongoId",
                table: "Instances",
                type: "text",
                nullable: true);
        }
    }
}
