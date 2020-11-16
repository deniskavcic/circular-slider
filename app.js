class Slider {

    sliders = [];

    constructor(options) {
        this.container = document.getElementById(options.container);
        this.svgId = "svg-circular-slider";
        this.sliders.push(options);

        this.sliderWidthHeight = 600;   
        this.circleParticle = {
            length: 20,
            spacing: 1
        }                                  
    }

    generate() {
        let svg = document.getElementById(this.svgId);
        if(!svg) {
            // container and SVG
            const svgContainer = document.createElement('div');
            svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('id', this.svgId);
            svg.setAttribute('height', this.sliderWidthHeight);
            svg.setAttribute('width', this.sliderWidthHeight);
            svgContainer.appendChild(svg);
            this.container.appendChild(svgContainer);
        }

        // SVG slider group
        const sliderGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        sliderGroup.setAttribute('slider-index', (this.sliders.length - 1));
        sliderGroup.setAttribute('transform', 'rotate(-90,' + this.sliderWidthHeight/2 + ',' + this.sliderWidthHeight/2 + ')');
        sliderGroup.setAttribute('radius', this.sliders[this.sliders.length - 1].radius);
        svg.appendChild(sliderGroup);

        //calculations
        const circumference = this.sliders[this.sliders.length - 1].radius * 2 * Math.PI;

        //draw slider path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', "M 500 299 A 200 200 0 1 0 500 300 z");
        path.style.stroke = this.sliders[this.sliders.length - 1].color;
        path.style.strokeWidth = 10;
        path.style.fill = 'none';
        path.setAttribute('stroke-dasharray', this.circleParticle.length + ' ' + this.circleParticle.spacing);
        sliderGroup.appendChild(path);
    }
}