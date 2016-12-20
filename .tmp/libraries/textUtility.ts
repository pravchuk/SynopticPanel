module powerbi.extensibility.visual.PBI_CV_815282F9_27F5_4950_9430_E910E0A8DB6A  {
    export interface TextProperties {
        text?: string;
        fontFamily: string;
        fontSize: string;
        fontWeight?: string;
        fontStyle?: string;
        fontVariant?: string;
        whiteSpace?: string;
    }

    export module TextUtility {
        let canvasCtx;
        let ellipsis = '...';
        function ensureCanvas() {
            if (canvasCtx)
                return;
            let canvas = document.createElement('canvas');
            canvasCtx = canvas.getContext("2d");
        }
        /**
         * Measures text width at a high speed using a canvas element
         * @param textProperties The text properties (including text content) to use for text measurement.
         */
        export function measureTextWidth(textProperties: TextProperties) {
            ensureCanvas();
            canvasCtx.font =
                (textProperties.fontStyle || "") + " " +
                (textProperties.fontVariant || "") + " " +
                (textProperties.fontWeight || "") + " " +
                textProperties.fontSize + " " +
                (textProperties.fontFamily);
            return canvasCtx.measureText(textProperties.text).width;
        }
        TextUtility.measureTextWidth = measureTextWidth;
        /**
         * Compares labels text size to the available size and renders ellipses when the available size is smaller.
         * @param textProperties The text properties (including text content) to use for text measurement.
         * @param maxWidth The maximum width available for rendering the text.
         */
        export function getTailoredTextOrDefault(textProperties: TextProperties, maxWidth: number) {
            ensureCanvas();
            let strLength = textProperties.text.length;
            if (strLength === 0)
                return textProperties.text;
            let width = measureTextWidth(textProperties);
            if (width < maxWidth)
                return textProperties.text;
            // Create a copy of the textProperties so we don't modify the one that's passed in.
            let copiedTextProperties: TextProperties = Object.create(textProperties);
            // Take the properties and apply them to svgTextElement
            // Then, do the binary search to figure out the substring we want
            // Set the substring on textElement argument
            let text = copiedTextProperties.text = ellipsis + copiedTextProperties.text;
            let min = 1;
            let max = text.length;
            let i = ellipsis.length;
            while (min <= max) {
                // num | 0 prefered to Math.floor(num) for performance benefits
                i = (min + max) / 2 | 0;
                copiedTextProperties.text = text.substr(0, i);
                width = measureTextWidth(copiedTextProperties);
                if (maxWidth > width)
                    min = i + 1;
                else if (maxWidth < width)
                    max = i - 1;
                else
                    break;
            }
            // Since the search algorithm almost never finds an exact match,
            // it will pick one of the closest two, which could result in a
            // value bigger with than 'maxWidth' thus we need to go back by 
            // one to guarantee a smaller width than 'maxWidth'.
            copiedTextProperties.text = text.substr(0, i);
            width = measureTextWidth(copiedTextProperties);
            if (width > maxWidth)
                i--;
            return text.substr(ellipsis.length, i - ellipsis.length) + ellipsis;
        }

        export function truncateAxis(text, width) {
             text.each(function() {
                var text = d3.select(this),
                    truncatedText = TextUtility.getTailoredTextOrDefault({text: text.text(), fontFamily: 'sans-serif', fontSize: '11px'}, width);
                text.text(truncatedText);
             });
        }

        export function wrapAxis(text, width, textProperties?: TextProperties, notEnclose?: boolean) {
            text.each(function() {
                var text = d3.select(this),
                    title = text.text(),
                    words = title.split(/\s+/).reverse(),
                    word,
                    line = [],
                    lineNumber = 0,
                    lineHeight = 1.1, // ems
                    y = parseFloat(text.attr("y")) || 0,
                    x = parseFloat(text.attr("x")) || 0,
                    dy = parseFloat(text.attr("dy")) || 0,
                    tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

                while (word = words.pop()) {
                    line.push(word);
                    tspan.text(line.join(" "));
                    let node = <any>tspan.node();

                    if (node.getComputedTextLength() > width) {

                        line.pop();
                        if (notEnclose)
                            tspan.text(line.join(" "));
                        else
                            tspan.text(TextUtility.getTailoredTextOrDefault({ text: line.join(" "), fontFamily: (textProperties ? textProperties.fontFamily : 'sans-serif'), fontSize: (textProperties ? textProperties.fontSize : '11px')}, width));
                        line = [word];
                        
                        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em");
                        if (notEnclose)
                            tspan.text(word);
                        else
                            tspan.text(TextUtility.getTailoredTextOrDefault({ text: word, fontFamily: (textProperties ? textProperties.fontFamily : 'sans-serif'), fontSize: (textProperties ? textProperties.fontSize : '11px')}, width));
                    }
                }

                text.append("title").text(title);

            });
        }

        /*export function wrapText(textProperties: TextProperties, width: number, height: number): any {

            var lines = [];
            var words = textProperties.text.split(' ');

            var lastLine = ["", 0];
            for (var n = 0; n < words.length; n++) {
                var word = words[n] + " ";
                var wordWidth = TextUtility.measureTextWidth({ fontFamily: textProperties.fontFamily, fontSize: textProperties.fontSize, text: word });

                var testLine = lastLine[0] + word;
                var testWidth = <number>lastLine[1] + wordWidth;
                if (testWidth > width) {
                    lines.push(lastLine);
                    lastLine = [word, wordWidth];
                } else {
                    lastLine = [testLine, testWidth];
                }
            }

            if (lastLine[1] > width) {
                lastLine[0] = TextUtility.getTailoredTextOrDefault({ fontFamily: textProperties.fontFamily, fontSize: textProperties.fontSize, text: <any>lastLine[0] }, width);
                lastLine[1] = width;
            }
            lines.push(lastLine);

            if ((lines.length * (parseInt(textProperties.fontSize) + 2) - 2) > height)
                lines = [[TextUtility.getTailoredTextOrDefault(textProperties, width), width]];

            return lines;
        }*/
    }

    export module PixelConverter {
        const PxPtRatio: number = 4 / 3;
        const PixelString: string = 'px';

        /**
         * Appends 'px' to the end of number value for use as pixel string in styles
         */
        export function toString(px: number): string {
            return px + PixelString;
        }

        /**
         * Converts point value (pt) to pixels
         * Returns a string for font-size property
         * e.g. fromPoint(8) => '24px'
         */
        export function fromPoint(pt: number): string {
            return toString(fromPointToPixel(pt));
        }

       /**
        * Converts point value (pt) to pixels
        * Returns a number for font-size property
        * e.g. fromPoint(8) => 24px
        */
        export function fromPointToPixel(pt: number): number {
            return (PxPtRatio * pt);
        }

        /**
         * Converts pixel value (px) to pt
         * e.g. toPoint(24) => 8
         */
        export function toPoint(px: number): number {
            return px / PxPtRatio;
        }
    }
}