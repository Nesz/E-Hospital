namespace Parser;

public class DataType
{
     
 /*
  * A string of characters that identifies an Application Entity with leading and
  * trailing spaces (20H) being non-significant. A value consisting solely of spaces shall not be used.
  */
 public const string ApplicationEntity = "AE";
        
 /*
  * A string of characters with one of the following formats -- nnnD, nnnW, nnnM, nnnY;
  * where nnn shall contain the number of days for D, weeks for W, months for M, or years for Y.
  *
  * Example: "018M" would represent an age of 18 months.
  */
 public const string AgeString = "AS";

 /*
  * Ordered pair of 16-bit unsigned integers that is the value of a Data
  * not applicable 4 bytes fixed Element Tag.
  *
  * Example: A Data Element Tag of (0018,00FF) would be encoded as a
  * series of 4 bytes in a Little-Endian Transfer Syntax as 18H, 00H, FFH, 00H.
  */
 public const string AttributeTag = "AT";
        
 /*
  * A string of characters with leading or trailing spaces (20H) being non-significant.
  */
 public const string CodeString = "CS";
        
 /*
  * A string of characters of the format YYYYMMDD; where YYYY shall contain year,
  * MM shall contain the month, and DD shall contain the day,
  * interpreted as a date of the Gregorian calendar system.
  * 
  * Example: "19930822" would represent August 22, 1993.
  */
 public const string Date = "DA";
        
 /*
  * A string of characters representing either a fixed point number or a floating point number.
  * A fixed point number shall contain only the characters 0-9 with an optional leading "+" or "-"
  * and an optional "." to mark the decimal point. A floating point number shall be conveyed
  * as defined in ANSI X3.9, with an "E" or "e" to indicate the start of the exponent.
  * Decimal Strings may be padded with leading or trailing spaces. Embedded spaces are not allowed.
  */
 public const string DecimalString = "DS";
        
 /*
  * A concatenated date-time character string in the format:
  *     YYYYMMDDHHMMSS.FFFFFF&ZZXX
  * The components of this string, from left to right, are
  *    YYYY = Year,
  *    MM = Month,
  *    DD = Day,
  *    HH = Hour (range "00" - "23"),
  *    MM = Minute (range "00" - "59"),
  *    SS = Second (range "00" - "60"),
  *    FFFFFF = Fractional Second contains a fractional part of a second
  *             as small as 1 millionth of a second (range "000000" - "999999").
  *    &ZZXX = an optional suffix for offset from Coordinated Universal Time (UTC), where
  *       & = "+" or "-",
  *       ZZ = Hours,
  *       XX = Minutes of offset.
  *
  * The year, month, and day shall be interpreted as a date of the Gregorian calendar system.
  * A 24-hour clock is used. Midnight shall be represented by only "0000" since "2400" would violate the hour range
  * 
  * The Fractional Second component, if present, shall contain 1 to 6 digits. If Fractional Second
  * is unspecified the preceding "." shall not be included. The offset suffix,
  * if present, shall contain 4 digits. The string may be padded with trailing SPACE characters.
  * Leading and embedded spaces are not allowed.
  *
  * A component that is omitted from the string is termed a null component. Trailing null components
  * of Date Time indicate that the value is not precise to the precision of those components.
  * The YYYY component shall not be null. Non-trailing null components are prohibited.
  * The optional suffix is not considered as a component.
  *
  * A Date Time value without the optional suffix is interpreted to be in the local time zone of the application
  * creating the Data Element, unless explicitly specified by the Timezone Offset From UTC (0008,0201).
  *
  * UTC offsets are calculated as "local time minus UTC". The offset for a Date Time value in UTC shall be +0000.
  */
 public const string DateTime = "DT";

 /*
  * Single precision binary floating point number represented in IEEE 754:1985
  * 32-bit Floating Point Number Format.
  */
 public const string FloatingPointSingle = "FL";
        
 /*
  * Double precision binary floating point number represented in IEEE
  * 754:1985 64-bit Floating Point Number Format.
  */
 public const string FloatingPointDouble = "FD";
        
 /*
  * A string of characters representing an Integer in base-10 (decimal), shall contain only the
  * characters 0 - 9, with an optional leading "+" or "-". It may be padded with leading and/or trailing spaces.
  * Embedded spaces are not allowed.
  *
  * The integer, n, represented shall be in the range: -2^31 <= n <= (2^31-1).
  */
 public const string IntegerString = "IS";
        
 /*
  * A character string that may be padded with leading and/or trailing spaces.
  * The character code 5CH (the BACKSLASH "\" in ISO-IR6) shall not be present,
  * as it is used as the delimiter between values in multi-valued data elements.
  * The string shall not have Control Characters except for ESC.
  */
 public const string LongString = "LO";
        
 /*
  * A character string that may contain one or more paragraphs. It may contain the
  * Graphic Character set and the Control Characters, CR, LF, FF, and ESC.
  * It may be padded with trailing spaces, which may be ignored, but leading spaces
  * are considered to be significant. Data Elements with this VR shall not be multi-valued
  * and therefore character code 5CH (the BACKSLASH "\" in ISO-IR6) may be used.
  */
 public const string LongText = "LT";
        
 /**
         * An octet-stream where the encoding of the contents is specified
         * by the negotiated Transfer Syntax. OB is a VR that is insensitive
         * to byte ordering (see Section 7.3). The octet-stream shall be
         * padded with a single trailing NULL byte value (00H) when
         * necessary to achieve even length.
         */
 public const string OtherByteString = "OB";
        
 /*
  * A stream of 64-bit IEEE 754:1985 floating point words. OD is a VR that
  * requires byte swapping within each 64-bit word when changing byte ordering
  */
 public const string OtherDouble = "OD";
        
 /*
  * A stream of 32-bit IEEE 754:1985 floating point words. OF is a VR that
  * requires byte swapping within each 32-bit word when changing byte ordering
  */
 public const string OtherFloat = "OF";
        
 /*
  * A stream of 32-bit words where the encoding of the contents is specified by the negotiated Transfer Syntax.
  * OL is a VR that requires byte swapping within each word when changing byte ordering
  */
 public const string OtherLong = "OL";
        
 /*
  * A stream of 64-bit words where the encoding of the contents is specified by the negotiated Transfer Syntax.
  * OV is a VR that requires byte swapping within each word when changing byte ordering
  */
 public const string OtherLong64 = "OV";
        
 /*
  * A stream of 16-bit words where the encoding of the contents is specified by the negotiated Transfer Syntax.
  * OW is a VR that requires byte swapping within each word when changing byte ordering
  */
 public const string OtherWord = "OW";
         
 /*
  * 
  */
 public const string PersonName = "PN";
         
 /*
  * A character string that may be padded with leading and/or trailing spaces.
  * The character code 05CH (the BACKSLASH "\" in ISO-IR6) shall not be present,
  * as it is used as the delimiter between values for multiple data elements.
  * The string shall not have Control Characters except ESC.
  */
 public const string ShortString = "SH";
        
 /*
  * Signed binary integer 32 bits long in 2's complement form.
  *
  * Represents an integer, n, in the range: - 2^31 <= n <= 2^31-1
  */
 public const string SignedLong = "SL";
        
 /*
  * Value is a Sequence of zero or more Items
  */
 public const string SequenceOfItems = "SQ";
        
 /*
  * Signed binary integer 16 bits long in 2's complement form.
  *
  * Represents an integer n in the range: -2^15 <= n <= 2^15-1.
  */
 public const string SignedShort = "SS";
        
 /*
  * A character string that may contain one or more paragraphs.
  * It may contain the Graphic Character set and the Control Characters,
  * CR, LF, FF, and ESC. It may be padded with trailing spaces, which
  * may be ignored, but leading spaces are considered to be significant.
  * Data Elements with this VR shall not be multi-valued and therefore
  * character code 5CH (the BACKSLASH "\" in ISO-IR6) may be used
  */
 public const string ShortText = "ST";
        
 /*
  * Signed binary integer 64 bits long. Represents an integer n in the range:
  * -2^63 <= n <= 2^63-1
  */
 public const string Signed64 = "SV";
        
 /*
  * 
  */
 public const string Time = "TM";
        
 /*
  * A character string that may be of unlimited length that may be padded with trailing spaces.
  * The character code 5CH (the BACKSLASH "\" in ISO-IR 6) shall not be present, as it is used as
  * the delimiter between values in multi-valued data elements.
  * The string shall not have Control Characters except for ESC.
  */
 public const string UnlimitedCharacters = "UC";
        
 /**
         * A character string containing a UID that is used to uniquely identify a wide variety of items.
         * The UID is a series of numeric components separated by the period "." character.
         * If a Value Field containing one or more UIDs is an odd number of bytes in length,
         * the Value Field shall be padded with a single trailing NULL (00H) character
         * to ensure that the Value Field is an even number of bytes in length
         */
 public const string UniqueIdentifier = "UI";
        
 /*
  * Unsigned binary integer 32 bits long. Represents an integer n in the range:
  * 0 <= n < 2^32
  */
 public const string UnsignedLong = "UL";

 /*
  * An octet-stream where the encoding of the contents is unknown
  */
 public const string Unknown = "UN";

 /*
  * A string of characters that identifies a URI or a URL as defined in [RFC3986].
  * Leading spaces are not allowed. Trailing spaces shall be ignored.
  * Data Elements with this VR shall not be multi-valued
  */
 public const string Uri = "UR";
        
 /*
  * Unsigned binary integer 16 bits long. Represents integer n in the range:
  * 0 <= n < 2^16
  */
 public const string UnsignedShort = "US";
        
 /*
  * A character string that may contain one or more paragraphs. It may contain the Graphic Character
  * set and the Control Characters, CR, LF, FF, and ESC. It may be padded with trailing spaces, which
  * may be ignored, but leading spaces are considered to be significant. Data Elements with this
  * VR shall not be multi-valued and therefore character code 5CH (the BACKSLASH "\" in ISO-IR6) may be used
  */
 public const string UnlimitedText = "UT";
        
 /*
  * Unsigned binary integer 64 bits long. Represents an integer n in the range:
  * 0 <= n < 2^64
  */
 public const string Unsigned64 = "UV";
}