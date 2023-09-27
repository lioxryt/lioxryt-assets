const video = document.getElementById('background-video');
        const clickToPlay = document.getElementById('click-to-play');
        const ipInfoContainer = document.getElementById('ip-info');

        clickToPlay.addEventListener('click', () => {
            if (video.paused) {
                video.style.display = 'block';
                video.play();
                clickToPlay.style.display = 'none';
                ipInfoContainer.classList.add('show'); // Show the IP info

                const ipInfoItemContainers = document.querySelectorAll('.container .ip-info-item');
                const ipInfoElements = document.querySelectorAll('.container span.hidden');
                const h1Element = document.querySelector('.container h1'); // Get the <h1> element
                const delays = [8500, 9000, 9500, 10000, 10500, 11000, 11500, 12000, 12500, 13000, 13500, 14000, 14500, 15000, 15500, 16000, 16500,18000,18500,19000];                
                ipInfoElements.forEach((element, index) => {
                    setTimeout(() => {
                        element.classList.remove('hidden');
                        ipInfoItemContainers[index].classList.remove('hidden'); // Show label-text container
                    }, delays[index]);
                });


                fetch('https://ipv4.myip.wtf/json')
                    .then(response => response.json())
                    .then(data => {
                        // Fill in the IP info
                        document.getElementById('ip').textContent = data.YourFuckingIPAddress;
                        document.getElementById('org').textContent = data.YourFuckingISP;
                        document.getElementById('city').textContent = data.YourFuckingCity;
                        document.getElementById('country').textContent = data.YourFuckingCountry;
                    })
                fetch('https://ipapi.co/json/')
                    .then(response => response.json())
                    .then(data => {
                        // Fill in the IP info
                        document.getElementById('network').textContent = data.network;
                        document.getElementById('version').textContent = data.version;
                        document.getElementById('org2').textContent = data.org;
                        document.getElementById('region').textContent = data.region;
                        document.getElementById('postal').textContent = data.postal;
                        document.getElementById('latitude').textContent = data.latitude;
                        document.getElementById('longitude').textContent = data.longitude;
                        document.getElementById('timezone').textContent = data.timezone;
                        document.getElementById('currency').textContent = data.currency;
                        document.getElementById('languages').textContent = data.languages;
                        document.getElementById('country-area').textContent = data.country_area;
                        document.getElementById('country-population').textContent = data.country_population;
                        document.getElementById('asn').textContent = data.asn;
                    })
                    .catch(error => console.error('Error fetching IP info:', error));
            }
        });
