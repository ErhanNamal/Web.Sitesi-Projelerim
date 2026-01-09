document.addEventListener('DOMContentLoaded', function() {
        
        // menü
        const mobileButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        mobileButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        // sayaç
        const deadline = new Date("january 16, 2026 12:00:00").getTime();
        const countdownInterval = setInterval(function() {
            const now = new Date().getTime();
            const distance = deadline - now;
            
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            if (distance > 0) {
                document.getElementById("days").innerHTML = days;
                document.getElementById("hours").innerHTML = hours < 10 ? '0' + hours : hours;
                document.getElementById("minutes").innerHTML = minutes < 10 ? '0' + minutes : minutes;
                document.getElementById("seconds").innerHTML = seconds < 10 ? '0' + seconds : seconds;
            } else {
                clearInterval(countdownInterval);
                document.getElementById("countdown-timer").innerHTML = "<p class='text-2xl font-bold text-yellow-400'>BAŞVURULAR KAPANDI!</p>";
            }
        }, 1000);

        //kurallar kısmı
        const accordionButtons = document.querySelectorAll('[id^="accordion-btn-"]');
        accordionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const contentId = button.id.replace('btn', 'content');
                const iconId = button.id.replace('btn', 'icon');
                const content = document.getElementById(contentId);
                const icon = document.getElementById(iconId);

                content.classList.toggle('hidden');
                icon.classList.toggle('rotate-180');

                accordionButtons.forEach(otherButton => {
                    if (otherButton !== button) {
                        const otherContent = document.getElementById(otherButton.id.replace('btn', 'content'));
                        const otherIcon = document.getElementById(otherButton.id.replace('btn', 'icon'));
                        
                        if (!otherContent.classList.contains('hidden')) {
                            otherContent.classList.add('hidden');
                            otherIcon.classList.remove('rotate-180');
                        }
                    }
                });
            });
        });

        //form kısmı
        recipeForm();
        fetchSubmissions();

    });
    //dosya yükleme ve form gönderme 
    function recipeForm () {
        const form = document.getElementById('recipe-submission-form');
        if (!form) return;
        
        const emailInput = document.getElementById('email');
        const fileInput = document.getElementById('file_upload');
        const successMessage = document.getElementById('success-message');
        const API_ENDPOINT = 'http://localhost:3000/api/v1/form-submit'; 

        form.addEventListener('submit', function(event) {
            event.preventDefault();
            
            let isValid = true;
    
            if (isValid) {
            
                const submitButton = document.getElementById('submit-button');
                submitButton.disabled = true;
                submitButton.textContent = 'Başvuru Gönderiliyor... Lütfen Bekleyin.';
        
                const formData = new FormData(form); 

                fetch(API_ENDPOINT, {
                    method: 'POST',
                    body: formData,
                })
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error(`Başarısız Yanıt: ${response.status} ${response.statusText}. Lütfen tüm alanları kontrol edin.`);
                    }
                })
                .then(data => {
                    console.log('Başvuru başarıyla alındı:', data);

                    form.reset(); 
                    successMessage.classList.remove('hidden');
                    submitButton.textContent = 'Başvuru Alındı!';
                    // Yeniden yükle: yeni başvuruları göster
                    if (typeof fetchSubmissions === 'function') fetchSubmissions();
                    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                })
                .catch(error => {
                    console.error('Gönderim hatası:', error.message);
                    alert(`Başvuru başarısız oldu. Hata: ${error.message}`);

                    submitButton.textContent = 'Tekrar Dene';
                })
                .finally(() => {
                    submitButton.disabled = false;
                    setTimeout(() => {
                        submitButton.textContent = 'TARİFİ GÖNDER VE HEYECANA KATIL';
                    }, 5000); 
                });
            }
            
        });
    }

    // trendleri getir (ilk 3 gösterme, butona tıklayınca hepsi)
    function fetchFoodTrends() {
        const URL = 'http://localhost:3000/api/v1/trends'; 
        const TREND = document.getElementById('trend-list');
        const SHOW_BTN = document.getElementById('show-more-trends');
        if (!TREND) return;

        fetch(URL)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Trend API bağlantı hatası');
                }
                return response.json();
            })
            .then(response => {
                const data = Array.isArray(response.data) ? response.data : [];
                window._trendsData = data;

                function render(count) {
                    TREND.innerHTML = '';
                    if (data.length === 0) {
                        TREND.innerHTML = '<p class="text-center text-gray-500 col-span-3">Trend verisi yok.</p>';
                        return;
                    }
                    data.slice(0, count).forEach(trend => {
                        const trendItem = `
                            <div class="p-4 bg-white rounded-lg shadow-md border-l-4 border-red-500">
                            <div class="p-1  ">
                                <img src="${SITE_URL+trend.image_url}" alt="${trend.name}" class="w-full h-40 object-cover mb-3 z-0 relative rounded-lg shadow-none transition-all duration-500 ease-in-out hover:shadow-lg hover:shadow-gray-400 hover:scale-110 "/>
                                </div>
                                <p class="font-semibold text-gray-900">${trend.name}</p>
                                <p class="text-sm text-gray-600">${trend.description}</p>
                            </div>
                        `;
                        TREND.innerHTML += trendItem;
                    });
                }

                render(3);

                if (SHOW_BTN) {
                    if (data.length <= 3) {
                        SHOW_BTN.style.display = 'none';
                    } else {
                        SHOW_BTN.style.display = 'inline-block';
                        SHOW_BTN.textContent = 'DAHA FAZLA GÖSTER';
                        let expanded = false;
                        SHOW_BTN.onclick = () => {
                            expanded = !expanded;
                            if (expanded) {
                                render(data.length);
                                SHOW_BTN.textContent = 'DAHA AZ GÖSTER';
                            } else {
                                render(3);
                                SHOW_BTN.textContent = 'DAHA FAZLA GÖSTER';
                            }
                        };
                    }
                }

            })
            .catch(error => {
                console.error('Trend verisi yüklenemedi:', error);
                TREND.innerHTML = `<p class="text-center text-red-500 col-span-3">Trend verileri şu anda yüklenemiyor.</p>`;
                if (SHOW_BTN) SHOW_BTN.style.display = 'none';
            });
    }
    fetchFoodTrends();
        
        // gönderimleri getir
        function fetchSubmissions() {
            const URL = 'http://localhost:3000/api/v1/submissions';
            const LIST = document.getElementById('submission-list');

            if (!LIST) return;
            LIST.innerHTML = '<p class="text-center text-gray-500 col-span-3">Gönderiler yükleniyor...</p>';

            fetch(URL)
                .then(res => {
                    if (!res.ok) throw new Error('Gönderiler getirilemedi');
                    return res.json();
                })
                .then(json => {
                    LIST.innerHTML = '';
                    if (!json.data || json.data.length === 0) {
                        LIST.innerHTML = '<p class="text-center text-gray-500 col-span-3">Henüz başvuru yok.</p>';
                        return;
                    }

                    json.data.slice(0, 12).forEach(item => {
                        const d = new Date(item.timestamp);
                        const name = item.data.full_name || 'İsim yok';
                        const recipe = item.data.recipe_name || 'Tarif yok';
                        const email = item.data.email ? item.data.email.replace(/(.{2}).+@/, '$1***@') : '';

                            let imagesHtml = '';
                            if (Array.isArray(item.files) && item.files.length) {
                                imagesHtml = '<div class="flex gap-2 mt-3">';
                                item.files.slice(0,3).forEach(f => {
                                
                                    if (f.mimetype && f.mimetype.startsWith('image')) {
                                        const src = 'http://localhost:3000' + f.url;
                                        imagesHtml += `<img src="${src}" alt="${f.originalname}" class="w-20 h-20 object-cover rounded">`;
                                    }
                                });
                                imagesHtml += '</div>';
                            }

                            const card = `
                                <div class="p-4 bg-gray-50 rounded-lg shadow relative shadow-xl">
                                    <button class="absolute top-2 right-2 text-red-600 hover:text-red-800 font-bold text-lg delete-btn" data-id="${item.id}">×</button>
                                    <p class="font-semibold text-gray-900">${name}</p>
                                    <p class="text-sm text-gray-600">${recipe}</p>
                                    <p class="text-xs text-gray-500 mt-2">${email}</p>
                                    <p class="text-xs text-gray-400 mt-2">${d.toLocaleString()}</p>
                                    ${imagesHtml}
                                </div>
                            `;
                            LIST.innerHTML += card;
                    });
                    document.querySelectorAll('.delete-btn').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            e.preventDefault();
                            const id = btn.getAttribute('data-id');
                            if (confirm('Bu başvuruyu silmek istediğinizden emin misiniz?')) {
                                fetch(`http://localhost:3000/api/v1/submissions/${id}`, { method: 'DELETE' })
                                    .then(r => r.json())
                                    .then(data => {
                                        if (data.status === 'success') {
                                            if (typeof fetchSubmissions === 'function') fetchSubmissions();
                                        }
                                    })
                                    .catch(err => console.error('Silme hatası:', err));
                            }
                        });
                    });
                })
                .catch(err => {
                    console.error('Gönderiler yüklenemedi:', err);
                    LIST.innerHTML = '<p class="text-center text-red-500 col-span-3">Gönderiler yüklenemedi.</p>';
                });
        }

const toggleBtn = document.getElementById('themeToggle');
const htmlElement = document.documentElement;

toggleBtn.addEventListener('click', function() {
    htmlElement.classList.toggle('dark');
});