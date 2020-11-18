class CircularSlider {

    constructor(options) {
        this.container = document.getElementById(options.container);
        this.options = options;
        this.svgId = "svg-circular-slider-" + this.options.container;
        this.svgContainerId = "svg-circular-slider-container-" + this.options.container;
        this.legendId = "circular-slider-legend-id-" + this.options.container;

        CircularSlider.prototype.shared++;
    
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
        let legend = document.getElementById(this.legendId);
        if(!svg) {
            //create legend
            legend = document.createElement('div');
            legend.setAttribute('id', this.legendId);
            legend.style.height = this.containerWidthHeight + "px";
            legend.style.width = (this.containerWidthHeight/2) + "px";  
            legend.style.paddingLeft = "10px";  
            legend.style.paddingTop = "100px";  
            legend.style.float = "left";  
            this.container.appendChild(legend);

            //container and SVG
            const svgContainer = document.createElement('div');
            svgContainer.setAttribute('id', this.svgContainerId);
            svgContainer.style.height = this.containerWidthHeight + "px";
            svgContainer.style.width = this.containerWidthHeight + "px";
            svgContainer.style.float = "left";  
            svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('id', this.svgId);
            svg.setAttribute('height', this.containerWidthHeight);
            svg.setAttribute('width', this.containerWidthHeight);
            svgContainer.appendChild(svg);
            this.container.appendChild(svgContainer);

            //event listeners
            svgContainer.addEventListener('mousedown', this.startEvent.bind(this), false); // bubbling / capturing
            svgContainer.addEventListener('touchstart', this.startEvent.bind(this), false);
            svgContainer.addEventListener('mouseup', this.endEvent.bind(this), false);
            svgContainer.addEventListener('touchend', this.endEvent.bind(this), false);
            svgContainer.addEventListener('mousemove', this.moveEvent.bind(this), false);
            svgContainer.addEventListener('touchmove', this.moveEvent.bind(this), false);
        }

        //legend row
        const row = document.createElement("div");
        row.innerHTML = "<span style='font-size:35px; display:inline-block; width:120px'><b>$<span id='" + this.legendId + "-" + CircularSlider.prototype.shared + "'>" + this.options.min + "<span></b></span> <span style='width:25px; height:15px; display:inline-block; background-color:" + this.options.color + "'></span> <span style='font-size:20px'>&nbsp;&nbsp;" + this.options.title + "</span>";
        legend.appendChild(row);

        //SVG group
        const sliderGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        sliderGroup.setAttribute('index', this.legendId + "-" + CircularSlider.prototype.shared);
        sliderGroup.setAttribute('min', this.options.min);
        sliderGroup.setAttribute('max', this.options.max);
        sliderGroup.setAttribute('step', this.options.step);
        sliderGroup.setAttribute('transform', 'rotate(-90,' + this.containerWidthHeight/2 + ',' + this.containerWidthHeight/2 + ')');
        svg.appendChild(sliderGroup);

        // calculations
        const circumference = this.options.radius * 2 * Math.PI; 
        const numOfParticles = Math.floor((circumference / this.circleParticle.length) * 0.75);
        const totalSpacing = circumference - numOfParticles * this.circleParticle.length;
        let circleParticleSpacing = totalSpacing / numOfParticles;

        // draw
        this.drawSliderPath(sliderGroup, circleParticleSpacing, 360, true); //background
        this.drawSliderPath(sliderGroup, circleParticleSpacing, 0, false); //slider
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
            this.redraw(relativeCords);
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
        this.redraw(relativeCords);
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

    redraw(relativeCords) {
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

        //redraw legend
        const min = this.activeSlider.getAttribute('min');
        const max = this.activeSlider.getAttribute('max');
        const step = this.activeSlider.getAttribute('step');
        const newVal = ((newAngle * (max - min)) / 360) + parseInt(min);
        const oldVal = parseInt(document.getElementById(this.activeSlider.getAttribute('index')).innerHTML);
        if((newVal - oldVal) >= 0) document.getElementById(this.activeSlider.getAttribute('index')).innerHTML = (step * Math.round(Math.abs(newVal - oldVal) / step)) + oldVal;
        else document.getElementById(this.activeSlider.getAttribute('index')).innerHTML = oldVal - (step * Math.round(Math.abs(newVal - oldVal) / step));
    }
}

CircularSlider.prototype.shared = 0;
