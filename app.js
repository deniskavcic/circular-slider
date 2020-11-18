class CircularSlider {

    constructor(options) {
        this.container = document.getElementById(options.container);
        this.svgId = "svg-circular-slider";
        this.svgContainerId = "svg-circular-slider-container";
        this.sliderId = "slider-index-";
        this.handlerId = "slider-handler-index-";
        this.options = options;

        this.containerWidthHeight = 600;   
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
        this.activeSlider = null; 
    }

    generate() {
        let svg = document.getElementById(this.svgId);
        if(!svg) {
            // container and SVG
            const svgContainer = document.createElement('div');
            svgContainer.setAttribute('id', this.svgContainerId);
            svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('id', this.svgId);
            svg.setAttribute('height', this.containerWidthHeight);
            svg.setAttribute('width', this.containerWidthHeight);
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
        sliderGroup.setAttribute('transform', 'rotate(-90,' + this.containerWidthHeight/2 + ',' + this.containerWidthHeight/2 + ')');
        svg.appendChild(sliderGroup);

        // calculations
        const circumference = this.options.radius * 2 * Math.PI; 
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
        path.setAttribute('d', this.pathAttribute(this.options.radius, angle));
        path.style.stroke =  background === true ? this.circleParticle.color : this.options.color;
        path.style.strokeWidth = this.circleParticle.width;
        path.style.fill = 'none';
        if(background) path.setAttribute('stroke-dasharray', this.circleParticle.length + ' ' + circleParticleSpacing);
        sliderGroup.appendChild(path);
        if(!background) { // draw handler
            path.setAttribute('radius', this.options.radius);
            const center = this.polarToCartesian(this.options.radius, angle)
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
        const x = this.containerWidthHeight/2 + (radius * Math.cos(angleRad));
        const y = this.containerWidthHeight/2 + (radius * Math.sin(angleRad));
        return {x, y};
    }

    startEvent(event) {
        if(this.activeSlider) return
        const svgContainer = document.getElementById(this.svgContainerId).getBoundingClientRect();
        const relativeCords = this.calculateRelativeCords(event, svgContainer);  

        if(event.path[0].tagName == "circle" || event.path[0].tagName == "path") {
            this.activeSlider = event.path[1];
            this.redrawActiveSliderPath(relativeCords);
        }
    }

    endEvent(event) {
        if(!this.activeSlider) return
        this.activeSlider = null;
    }

    moveEvent(event) {
        if(!this.activeSlider) return
        event.preventDefault();
        const svgContainer = document.getElementById(this.svgContainerId).getBoundingClientRect();
        const relativeCords = this.calculateRelativeCords(event, svgContainer); 
        this.redrawActiveSliderPath(relativeCords);
    }    

    calculateRelativeCords(event, svgContainer) { 
        let x = event.clientX;
        let y = event.clientY;
        x = x === undefined ? event.touches[0].clientX : x;
        y = y === undefined ? event.touches[0].clientY : y;
        const left = x - svgContainer.left;
        const top = y - svgContainer.top;
        return { left, top }
    }

    redrawActiveSliderPath(relativeCords) {
        const slider = this.activeSlider.getElementsByTagName('path')[1];
        //calculate new angle in degrees
        let newAngle = (Math.atan2((relativeCords.left - this.containerWidthHeight/2), (this.containerWidthHeight/2) - relativeCords.top)) * (180 / Math.PI);
        newAngle = newAngle >= 0 ? newAngle : newAngle + 360;

        //redraw active slider
        slider.setAttribute('d', this.pathAttribute(parseInt(slider.getAttribute('radius')), newAngle));

        //redraw handler
        const handlerCenter = this.polarToCartesian(parseInt(slider.getAttribute('radius')), newAngle)
        const handler = this.activeSlider.getElementsByTagName('circle')[0];
        handler.setAttribute('cx', handlerCenter.x);
        handler.setAttribute('cy', handlerCenter.y);
    }
}
