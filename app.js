class CircularSlider {

    constructor(options) {
        this.container = document.getElementById(options.container);
        this.svgId = "svg-circular-slider";
        this.svgContainerId = "svg-circular-slider-container";
        this.sliderId = "slider-index-";
        this.handlerId = "slider-handler-index-";
        CircularSlider.shared.push(options);

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
        this.mouseTouchDown = false;      
        this.activeSliderIndex;              
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
        const circumference = CircularSlider.shared[CircularSlider.shared.length - 1].radius * 2 * Math.PI; 
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
        path.setAttribute('d', this.pathAttribute(CircularSlider.shared[CircularSlider.shared.length - 1].radius, angle));
        path.style.stroke =  background === true ? this.circleParticle.color : CircularSlider.shared[CircularSlider.shared.length - 1].color;
        path.style.strokeWidth = this.circleParticle.width;
        path.style.fill = 'none';
        if(background) path.setAttribute('stroke-dasharray', this.circleParticle.length + ' ' + circleParticleSpacing);
        sliderGroup.appendChild(path);
        if(!background) { // draw handler
            path.setAttribute('id', (this.sliderId + (CircularSlider.shared.length - 1)));
            const center = this.polarToCartesian(CircularSlider.shared[CircularSlider.shared.length - 1].radius, angle)
            const handler = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            handler.setAttribute('id', this.handlerId + (CircularSlider.shared.length - 1));
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
        if(this.mouseTouchDown) return
        this.mouseTouchDown = true;
        const svgContainer = document.getElementById(this.svgContainerId).getBoundingClientRect();
        const relativeCords = this.calculateRelativeCords(event, svgContainer);  
        const centerDistance = Math.hypot(relativeCords.left - (this.containerWidthHeight/2), relativeCords.top - (this.containerWidthHeight/2));
        const allDistances = CircularSlider.shared.map(x => Math.abs(x.radius - centerDistance));
        this.activeSliderIndex = allDistances.indexOf(Math.min(...allDistances));
        
        this.redrawActiveSliderPath(relativeCords);
    }

    endEvent(event) {
        if(!this.mouseTouchDown) return
        this.mouseTouchDown = false;
    }

    moveEvent(event) {
        if(!this.mouseTouchDown) return
    }    

    calculateRelativeCords(event, svgContainer) {   
        const left = event.clientX - svgContainer.left;
        const top = event.clientY - svgContainer.top;
        return { left, top }
    }

    redrawActiveSliderPath(relativeCords) {
        const activeSlider = document.getElementById(this.sliderId + this.activeSliderIndex);

        //calculate new angle in degrees
        let newAngle = (Math.atan2((relativeCords.left - this.containerWidthHeight/2), (this.containerWidthHeight/2) - relativeCords.top)) * (180 / Math.PI);
        newAngle = newAngle >= 0 ? newAngle : newAngle + 360;

        //redraw active slider
        activeSlider.setAttribute('d', this.pathAttribute(CircularSlider.shared[this.activeSliderIndex].radius, newAngle));

        //redraw handler
        const handlerCenter = this.polarToCartesian(CircularSlider.shared[this.activeSliderIndex].radius, newAngle)
        const handler = document.getElementById(this.handlerId + this.activeSliderIndex);
        handler.setAttribute('cx', handlerCenter.x);
        handler.setAttribute('cy', handlerCenter.y);
    }
}

CircularSlider.shared = [];