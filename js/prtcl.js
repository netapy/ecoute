particlesJS("particles-js", {
    "particles": {
        "number": {
            "value": 2,
            "density": {
                "enable": true,
                "value_area": 100
            }
        },
        "color": {
            "value": "#5770be"
        },
        "shape": {
            "type": "circle",
        },
        "opacity": {
            "value": 0.15,
            "random": false,
            "anim": {
                "enable": false,
                "speed": 20,
                "opacity_min": 0.1,
                "sync": false
            }
        },
        "size": {
            "value": 5,
            "random": true,
            "anim": {
                "enable": false,
                "speed": 220,
                "size_min": 0.1,
                "sync": false
            }
        },
        "move": {
            "enable": true,
            "speed": 7,
            "direction": "bottom-left",
            "random": true,
            "straight": false,
            "out_mode": "out",
            "bounce": false,
            "attract": {
                "enable": false,
                "rotateX": 560,
                "rotateY": 1200
            }
        }
    },
    "interactivity": {
        "detect_on": "canvas",
        "events": {
            "onhover": {
                "enable": false,
                "mode": "repulse"
            },
            "onclick": {
                "enable": false,
                "mode": "push"
            },
            "resize": true
        },
        "modes": {
            "grab": {
                "distance": 400,
                "line_linked": {
                    "opacity": 1
                }
            },
            "bubble": {
                "distance": 400,
                "size": 40,
                "duration": 2,
                "opacity": 8,
                "speed": 3
            },
            "repulse": {
                "distance": 200,
                "duration": 0.4
            },
            "push": {
                "particles_nb": 24
            },
            "remove": {
                "particles_nb": 2
            }
        }
    },
    "retina_detect": true
});