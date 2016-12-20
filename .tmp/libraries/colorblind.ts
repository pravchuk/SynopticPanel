/*
 * OKViz Utilities - Color Blind
 * v1.0.0
*/

module powerbi.extensibility.visual.PBI_CV_815282F9_27F5_4950_9430_E910E0A8DB6A  {

    export module OKVizUtility {

        var visionDefs = '<defs><filter id="visionNormal"><feColorMatrix values="1 0 0 0 0				0 1 0 0 0				0 0 1 0 0				0 0 0 1 0"/></filter><filter id="visionProtanopia" color-interpolation-filters="sRGB"><feColorMatrix values="0.152286 1.052583 -0.204868 0 0				0.114503 0.786281 0.099216 0 0				-0.003882 -0.048116 1.051998 0 0				0 0 0 1 0"/><feComponentTransfer><feFuncB type="gamma" exponent=".9"/><feFuncR type="gamma" exponent=".9"/><feFuncG type="gamma" exponent=".9"/></feComponentTransfer></filter><filter id="visionProtanomaly" color-interpolation-filters="sRGB"><feColorMatrix values="0.458064 0.679578 -0.137642 0 0				0.092785 0.846313 0.060902 0 0				-0.007494 -0.016807 1.024301 0 0				0 0 0 1 0"/><feComponentTransfer><feFuncB type="gamma" exponent=".9"/><feFuncR type="gamma" exponent=".9"/><feFuncG type="gamma" exponent=".9"/></feComponentTransfer></filter><filter id="visionDeuteranopia" color-interpolation-filters="sRGB"><feColorMatrix values="0.367322 0.860646 -0.227968 0 0				0.280085 0.672501 0.047413 0 0				-0.011820 0.042940 0.968881 0 0				0 0 0 1 0"/><feComponentTransfer><feFuncB type="gamma" exponent=".9"/><feFuncR type="gamma" exponent=".9"/><feFuncG type="gamma" exponent=".9"/></feComponentTransfer></filter><filter id="visionDeuteranomaly" color-interpolation-filters="sRGB"><feColorMatrix values="0.547494 0.607765 -0.155259 0 0				0.181692 0.781742 0.036566 0 0				-0.010410 0.027275 0.983136 0 0				0 0 0 1 0"/><feComponentTransfer><feFuncB type="gamma" exponent=".9"/><feFuncR type="gamma" exponent=".9"/><feFuncG type="gamma" exponent=".9"/></feComponentTransfer></filter><filter id="visionTritanopia" color-interpolation-filters="sRGB"><feColorMatrix values="1.255528 -0.076749 -0.178779 0 0				-0.078411 0.930809 0.147602 0 0				0.004733 0.691367 0.303900 0 0				0 0 0 1 0"/><feComponentTransfer><feFuncB type="gamma" exponent=".9"/><feFuncR type="gamma" exponent=".9"/><feFuncG type="gamma" exponent=".9"/></feComponentTransfer></filter><filter id="visionTritanomaly" color-interpolation-filters="sRGB"><feColorMatrix values="1.017277 0.027029 -0.044306 0 0				-0.006113 0.958479 0.047634 0 0				0.006379 0.248708 0.744913 0 0				0 0 0 1 0"/><feComponentTransfer><feFuncB type="gamma" exponent=".9"/><feFuncR type="gamma" exponent=".9"/><feFuncG type="gamma" exponent=".9"/></feComponentTransfer></filter><filter id="visionAchromatopsia" color-interpolation-filters="sRGB"><feColorMatrix values="0.212656 0.715158 0.072186 0 0				0.212656 0.715158 0.072186 0 0				0.212656 0.715158 0.072186 0 0				0 0 0 1 0"/><feColorMatrix type="saturate" values="0" color-interpolation-filters="sRGB"/><feComponentTransfer><feFuncR type="gamma" exponent=".9"/><feFuncG type="gamma" exponent=".9"/><feFuncB type="gamma" exponent=".9"/></feComponentTransfer></filter><filter id="visionAchromatomaly" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0.5"/><feComponentTransfer><feFuncR type="gamma" exponent=".9"/><feFuncG type="gamma" exponent=".9"/><feFuncB type="gamma" exponent=".9"/></feComponentTransfer></filter><filter id="visionLowContrast" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncR type="linear" slope=".5" intercept=".25"/><feFuncG type="linear" slope=".5" intercept=".25"/><feFuncB type="linear" slope=".5" intercept=".25"/></feComponentTransfer></filter></defs>';

        export function applyColorBlindVision(vision: string, element: any) {
            if (!element || element === undefined) return;

            if (!(element instanceof d3.selection))
                element = d3.select(<any>element);

            element.selectAll('#visionFilter').remove();
            element.append('svg')
                .attr('id', 'visionFilter')
                .style('position', 'absolute')
                .html(visionDefs);

            element.style({
                'filter': 'url(#vision' + vision + ')',
                '-webkit-filter': 'url(#vision' + vision + ')'
            });
        }

        export function revertColorBlindVision(element: any) {
            applyColorBlindVision('normal', element);
        }
    }
}