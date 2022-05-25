import { DataSet } from "dicom-parser";
import { Tag } from "./tags.constants";

export interface DicomData {
  width: number,
  height: number,
  wc: number,
  ww: number,
  slope: number,
  intercept: number,
  bitsPerPixel: number,
  pixelRepresentation: number,
}


export const readDicomData = (dicom: DataSet) => {
  return {
    width: dicom.int16(Tag.WIDTH),
    height: dicom.int16(Tag.HEIGHT),
    wc: dicom.intString(Tag.WINDOW_CENTER),
    ww: dicom.intString(Tag.WINDOW_WIDTH),
    slope: dicom.intString(Tag.SLOPE) === undefined ? 1 : dicom.intString(Tag.SLOPE),
    intercept: dicom.intString(Tag.INTERCEPT) === undefined ? 1 : dicom.intString(Tag.INTERCEPT),
    bitsPerPixel: dicom.int16(Tag.BITS_PER_PIXEL),
    pixelRepresentation: dicom.int16(Tag.PIXEL_REPRESENTATION),
  };
}
