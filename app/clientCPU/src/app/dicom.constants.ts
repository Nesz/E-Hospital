import { FlipTool } from './model/impl/flip.tool';
import { CursorTool } from './model/impl/cursor.tool';
import { PanTool } from './model/impl/pan.tool';
import { ZoomTool } from './model/impl/zoom.tool';
import { WindowLevelTool } from './model/impl/window-level.tool';
import { RotateTool } from './model/impl/rotate.tool';
import { ShapeTool } from './model/impl/shape.tool';

export class DicomConstants {
  public static readonly TOOLS = [
    new CursorTool(),
    new PanTool(),
    new ZoomTool(),
    new RotateTool(),
    new ShapeTool(),
    new WindowLevelTool(),
    new FlipTool(),
  ];
}
