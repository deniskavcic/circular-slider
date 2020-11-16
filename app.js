class CircularSlider {

    sliders = [];

    constructor(options) {
        this.container = document.getElementById(options.container);
        this.svgId = "svg-circular-slider";
        this.sliders.push(options);

        this.sliderWidthHeight = 600;   
        this.circleParticle = {
            length: 15,
            width: 25,
            color: "#bfbfbf"
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
        const numOfParticles = Math.floor((circumference / this.circleParticle.length) * 0.8);
        const totalSpacing = circumference - numOfParticles * this.circleParticle.length;
        let circleParticleSpacing = totalSpacing / numOfParticles;

        //draw
        this.drawSliderPath(sliderGroup, circleParticleSpacing);
    }

    drawSliderPath(sliderGroup, circleParticleSpacing) {
        //draw slider path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', this.pathAttribute(this.sliderWidthHeight/2, this.sliderWidthHeight/2, this.sliders[this.sliders.length - 1].radius, 360));
        path.style.stroke = this.circleParticle.color;
        path.style.strokeWidth = this.circleParticle.width;
        path.style.fill = 'none';
        path.setAttribute('stroke-dasharray', this.circleParticle.length + ' ' + circleParticleSpacing);
        sliderGroup.appendChild(path);
    }

    pathAttribute (centerX, centerY, radius, angle) {
        angle = angle === 360 ? 359 : angle;
        let arc = angle <= 180 ? '0' : '1';
        let start = this.polarToCartesian(centerX, centerY, radius, angle);
        let end = this.polarToCartesian(centerX, centerY, radius, 0);
        let path = ['M', start.x, start.y, 'A', radius, radius, 0, arc, 0, end.x, end.y].join(' ');

        if (angle === 359) path = path + ' Z';

        return path;
    }

    polarToCartesian (centerX, centerY, radius, angleDeg) {
        const angleRad = angleDeg * Math.PI / 180;
        const x = centerX + (radius * Math.cos(angleRad));
        const y = centerY + (radius * Math.sin(angleRad));
        return {x, y};
    }

}