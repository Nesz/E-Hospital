using Microsoft.EntityFrameworkCore.Migrations;

namespace DicomViewer3.Migrations
{
    public partial class InstancesInFiles : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FilePath",
                table: "Series",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "ChunkSize",
                table: "Instances",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "FileOffset",
                table: "Instances",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FilePath",
                table: "Series");

            migrationBuilder.DropColumn(
                name: "ChunkSize",
                table: "Instances");

            migrationBuilder.DropColumn(
                name: "FileOffset",
                table: "Instances");
        }
    }
}
