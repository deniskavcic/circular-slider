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
        this.handler = {
            width: 2, 
            color: "white",
            strokeColor: "gray"
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

            // event listeners
            svgContainer.addEventListener('mousedown', this.startEvent.bind(this), false); // bubbling / capturing
            svgContainer.addEventListener('touchstart', this.startEvent.bind(this), false);
            svgContainer.addEventListener('mouseup', this.endEvent.bind(this), false);
            svgContainer.addEventListener('touchend', this.endEvent.bind(this), false);
            svgContainer.addEventListener('mousemove', this.moveEvent.bind(this), false);
            svgContainer.addEventListener('touchmove', this.moveEvent.bind(this), false);
            
        }

        // SVG slider group
        const sliderGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        sliderGroup.setAttribute('slider-index', (this.sliders.length - 1));
        sliderGroup.setAttribute('transform', 'rotate(-90,' + this.sliderWidthHeight/2 + ',' + this.sliderWidthHeight/2 + ')');
        sliderGroup.setAttribute('radius', this.sliders[this.sliders.length - 1].radius);
        svg.appendChild(sliderGroup);

        // calculations
        const circumference = this.sliders[this.sliders.length - 1].radius * 2 * Math.PI; 
        const numOfParticles = Math.floor((circumference / this.circleParticle.length) * 0.8);
        const totalSpacing = circumference - numOfParticles * this.circleParticle.length;
        let circleParticleSpacing = totalSpacing / numOfParticles;

        // draw
        this.drawSliderPath(sliderGroup, circleParticleSpacing, 360, true); //background
        this.drawSliderPath(sliderGroup, circleParticleSpacing, 60, false); //slider
    }

    drawSliderPath(sliderGroup, circleParticleSpacing, angle, background) {
        // draw slider path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', this.pathAttribute(this.sliders[this.sliders.length - 1].radius, angle));
        path.style.stroke =  background === true ? this.circleParticle.color : this.sliders[this.sliders.length - 1].color;
        path.style.strokeWidth = this.circleParticle.width;
        path.style.fill = 'none';
        if(background) path.setAttribute('stroke-dasharray', this.circleParticle.length + ' ' + circleParticleSpacing);
        sliderGroup.appendChild(path);
        if(!background) { // draw handler
            const center = this.polarToCartesian(this.sliders[this.sliders.length - 1].radius, angle)
            const handler = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            handler.setAttribute('cx', center.x);
            handler.setAttribute('cy', center.y);
            handler.setAttribute('r', this.circleParticle.width / 2);
            handler.style.stroke = this.handler.strokeColor;
            handler.style.strokeWidth = this.handler.width;
            handler.style.fill = this.handler.color;
            sliderGroup.appendChild(handler);
        }
    }

    pathAttribute (radius, angle) {
        angle = angle === 360 ? 359 : angle;
        let arc = angle <= 180 ? '0' : '1';
        let start = this.polarToCartesian(radius, angle);
        let end = this.polarToCartesian(radius, 0);
        let path = ['M', start.x, start.y, 'A', radius, radius, 0, arc, 0, end.x, end.y].join(' ');

        if (angle === 359) path = path + ' Z';

        return path;
    }

    polarToCartesian (radius, angleDeg) {
        const angleRad = angleDeg * Math.PI / 180;
        const x = this.sliderWidthHeight/2 + (radius * Math.cos(angleRad));
        const y = this.sliderWidthHeight/2 + (radius * Math.sin(angleRad));
        return {x, y};
    }

    startEvent(event) {
        
    }

    endEvent(event) {
        
    }

    moveEvent(event) {
        
    }    

}