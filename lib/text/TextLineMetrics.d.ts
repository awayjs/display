/**
 * The TextLineMetrics class contains information about the text position and
 * measurements of a line of text within a text field. All measurements are in
 * pixels. Objects of this class are returned by the
 * <code>away.entities.TextField.getLineMetrics()</code> method.
 */
export declare class TextLineMetrics {
    /**
     * The ascent value of the text is the length from the baseline to the top of
     * the line height in pixels.
     */
    ascent: number;
    /**
     * The descent value of the text is the length from the baseline to the
     * bottom depth of the line in pixels.
     */
    descent: number;
    /**
     * The height value of the text of the selected lines (not necessarily the
     * complete text) in pixels. The height of the text line does not include the
     * gutter height.
     */
    height: number;
    /**
     * The leading value is the measurement of the vertical distance between the
     * lines of text.
     */
    leading: number;
    /**
     * The width value is the width of the text of the selected lines (not
     * necessarily the complete text) in pixels. The width of the text line is
     * not the same as the width of the text field. The width of the text line is
     * relative to the text field width, minus the gutter width of 4 pixels
     * (2 pixels on each side).
     */
    width: number;
    /**
     * The x value is the left position of the first character in pixels. This
     * value includes the margin, indent (if any), and gutter widths.
     */
    x: number;
    /**
     * Creates a TextLineMetrics object. The TextLineMetrics object contains
     * information about the text metrics of a line of text in a text field.
     * Objects of this class are returned by the
     * away.entities.TextField.getLineMetrics() method.
     *
     * @param x           The left position of the first character in pixels.
     * @param width       The width of the text of the selected lines (not
     *                    necessarily the complete text) in pixels.
     * @param height      The height of the text of the selected lines (not
     *                    necessarily the complete text) in pixels.
     * @param ascent      The length from the baseline to the top of the line
     *                    height in pixels.
     * @param descent     The length from the baseline to the bottom depth of
     *                    the line in pixels.
     * @param leading     The measurement of the vertical distance between the
     *                    lines of text.
     */
    constructor(x?: number, width?: number, height?: number, ascent?: number, descent?: number, leading?: number);
}
