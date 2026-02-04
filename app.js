// WIRD OS - ЭТАП 1: Экран "Сегодня"
// Полностью офлайн, данные хранятся в localStorage

document.addEventListener('DOMContentLoaded', function() {
    // ======================
    // ИНИЦИАЛИЗАЦИЯ
    // ======================
    
    // Объект с данными за текущий день
    let todayData = {
        date: null,
        completed: false,
        ibadat: {
            quran: 0,
            azkarMorning: false,
            azkarEvening: false,
            salawat: 0,
            sadaka: false
        },
        discipline: {
            sleep: 0,
            sport: false,
            focus: ''
        },
        selfControl: {
            language: null, // 'preserved' или 'failed'
            gaze: null,
            anger: null
        }
    };
    
    // Массив аятов и мотивационных цитат (хранится локально)
    const dailyQuotes = [
        {
            text: "Воистину, с тягостью приходит облегчение.",
            source: "Коран 94:6"
        },
        {
            text: "Аллах не меняет положения людей, пока они не изменят самих себя.",
            source: "Коран 13:11"
        },
        {
            text: "Поминайте Меня, и Я буду помнить о вас.",
            source: "Коран 2:152"
        },
        {
            text: "Сердце верующего находится между двумя пальцами Милостивого.",
            source: "Хадис"
        },
        {
            text: "Терпение — это свет.",
            source: "Хадис"
        },
        {
            text: "Лучшие из вас — те, кто приносит наибольшую пользу другим.",
            source: "Хадис"
        },
        {
            text: "Совершай благие дела так, будто ты видишь Аллаха, и если ты не видишь Его, то Он видит тебя.",
            source: "Хадис"
        },
        {
            text: "Улыбка брату твоему — милостыня.",
            source: "Хадис"
        },
        {
            text: "Верующий подобен пчеле: питается только чистым и производит только чистое.",
            source: "Исламская мудрость"
        },
        {
            text: "Дисциплина сегодня — свобода завтра.",
            source: "Исламская мудрость"
        },
        {
            text: "Наилучшие дела — постоянные, даже если они малы.",
            source: "Хадис"
        },
        {
            text: "Помни о смерти — это отрезвляет душу.",
            source: "Исламская мудрость"
        },
        {
            text: "Терпение в момент гнева предотвращает тысячи сожалений.",
            source: "Исламская мудрость"
        },
        {
            text: "Знание — потерянное сокровище верующего, он вправе забрать его где бы ни нашел.",
            source: "Хадис"
        },
        {
            text: "Самый сильный — не тот, кто побеждает других, а тот, кто побеждает себя в гневе.",
            source: "Хадис"
        },
        {
            text: "Совершай молитву, и она станет светом в твоем сердце.",
            source: "Исламская мудрость"
        },
        {
            text: "Аллах любит, когда дела ваши совершаются тщательно.",
            source: "Хадис"
        },
        {
            text: "Молчание — мудрость, но мало кто его придерживается.",
            source: "Исламская мудрость"
        },
        {
            text: "Верующий не укушается дважды из одной норы.",
            source: "Хадис"
        },
        {
            text: "Будь в этом мире как странник или путник.",
            source: "Хадис"
        }
    ];
    
    // ======================
    // ЭЛЕМЕНТЫ ДОМ
    // ======================
    
    // Дата
    const currentDateElement = document.getElementById('currentDate');
    
    // Аят дня
    const dailyQuoteText = document.getElementById('dailyQuoteText');
    const dailyQuoteSource = document.getElementById('dailyQuoteSource');
    
    // Ибадат
    const quranInput = document.getElementById('quranInput');
    const azkarMorningCheckbox = document.getElementById('azkarMorning');
    const azkarEveningCheckbox = document.getElementById('azkarEvening');
    const salawatCountElement = document.getElementById('salawatCount');
    const sadakaCheckbox = document.getElementById('sadaka');
    
    // Дисциплина
    const sleepInput = document.getElementById('sleepInput');
    const sportCheckbox = document.getElementById('sport');
    const focusInput = document.getElementById('focusInput');
    
    // Самоконтроль кнопки
    const selfControlButtons = document.querySelectorAll('[data-action="self-control"]');
    
    // Кнопки
    const numberButtons = document.querySelectorAll('.number-btn');
    const counterButtons = document.querySelectorAll('.counter-btn');
    const resetSalawatButton = document.getElementById('resetSalawat');
    const completeDayButton = document.getElementById('completeDayBtn');
    const dayStatusElement = document.getElementById('dayStatus');
    
    // ======================
    // УТИЛИТЫ
    // ======================
    
    // Получить текущую дату в формате YYYY-MM-DD
    function getTodayDateString() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    // Форматирование даты для отображения
    function formatDateForDisplay(dateString) {
        const date = new Date(dateString);
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('ru-RU', options);
    }
    
    // Получить индекс для выбора цитаты дня (на основе даты)
    function getQuoteIndexForDate(dateString) {
        // Используем дату как seed для выбора цитаты
        const date = new Date(dateString);
        const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        return dayOfYear % dailyQuotes.length;
    }
    
    // Загрузить данные из localStorage
    function loadData() {
        const today = getTodayDateString();
        const savedData = localStorage.getItem(`wirdos_${today}`);
        
        if (savedData) {
            todayData = JSON.parse(savedData);
        } else {
            // Новый день
            todayData.date = today;
            todayData.completed = false;
        }
        
        // Обновить интерфейс
        updateUI();
    }
    
    // Сохранить данные в localStorage
    function saveData() {
        const today = getTodayDateString();
        localStorage.setItem(`wirdos_${today}`, JSON.stringify(todayData));
        
        // Показать уведомление о сохранении
        showSaveNotification();
    }
    
    // Показать уведомление о сохранении
    function showSaveNotification() {
        const status = dayStatusElement;
        const originalText = status.textContent;
        
        status.textContent = 'Сохранено';
        status.style.color = '#27ae60';
        
        setTimeout(() => {
            status.textContent = todayData.completed ? 'День завершён' : 'День активен';
            status.style.color = '';
        }, 1000);
    }
    
    // ======================
    // ОБНОВЛЕНИЕ ИНТЕРФЕЙСА
    // ======================
    
    function updateUI() {
        const today = getTodayDateString();
        
        // Обновить отображение даты
        currentDateElement.textContent = formatDateForDisplay(today);
        
        // Установить аят/цитату дня
        const quoteIndex = getQuoteIndexForDate(today);
        dailyQuoteText.textContent = dailyQuotes[quoteIndex].text;
        dailyQuoteSource.textContent = dailyQuotes[quoteIndex].source;
        
        // Ибадат
        quranInput.value = todayData.ibadat.quran;
        azkarMorningCheckbox.checked = todayData.ibadat.azkarMorning;
        azkarEveningCheckbox.checked = todayData.ibadat.azkarEvening;
        salawatCountElement.textContent = todayData.ibadat.salawat;
        sadakaCheckbox.checked = todayData.ibadat.sadaka;
        
        // Дисциплина
        sleepInput.value = todayData.discipline.sleep;
        sportCheckbox.checked = todayData.discipline.sport;
        focusInput.value = todayData.discipline.focus;
        
        // Самоконтроль
        updateSelfControlButtons('language', todayData.selfControl.language);
        updateSelfControlButtons('gaze', todayData.selfControl.gaze);
        updateSelfControlButtons('anger', todayData.selfControl.anger);
        
        // Статус дня
        if (todayData.completed) {
            document.body.classList.add('day-completed');
            completeDayButton.innerHTML = '<span class="btn-text">День завершён</span><span class="btn-icon">✓</span>';
            completeDayButton.disabled = true;
            dayStatusElement.textContent = 'День завершён';
            
            // Заблокировать поля ввода
            quranInput.disabled = true;
            azkarMorningCheckbox.disabled = true;
            azkarEveningCheckbox.disabled = true;
            sadakaCheckbox.disabled = true;
            sleepInput.disabled = true;
            sportCheckbox.disabled = true;
            focusInput.disabled = true;
            
            // Заблокировать все кнопки
            document.querySelectorAll('button').forEach(btn => {
                if (btn.id !== 'completeDayBtn') {
                    btn.disabled = true;
                }
            });
        } else {
            document.body.classList.remove('day-completed');
            completeDayButton.innerHTML = '<span class="btn-text">Завершить день</span><span class="btn-icon">✓</span>';
            completeDayButton.disabled = false;
            dayStatusElement.textContent = 'День активен';
            
            // Разблокировать поля ввода
            quranInput.disabled = false;
            azkarMorningCheckbox.disabled = false;
            azkarEveningCheckbox.disabled = false;
            sadakaCheckbox.disabled = false;
            sleepInput.disabled = false;
            sportCheckbox.disabled = false;
            focusInput.disabled = false;
            
            // Разблокировать кнопки
            document.querySelectorAll('button').forEach(btn => {
                btn.disabled = false;
            });
        }
    }
    
    // Обновить кнопки самоконтроля
    function updateSelfControlButtons(type, value) {
        // Сбросить все кнопки этого типа
        document.querySelectorAll(`[data-type="${type}"]`).forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Активировать выбранную кнопку
        if (value) {
            const activeBtn = document.querySelector(`[data-type="${type}"][data-value="${value}"]`);
            if (activeBtn) {
                activeBtn.classList.add('active');
            }
        }
    }
    
    // ======================
    // ОБРАБОТЧИКИ СОБЫТИЙ
    // ======================
    
    // Изменение числа (Коран, Сон)
    numberButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            let input;
            
            if (action.includes('quran')) {
                input = quranInput;
                todayData.ibadat.quran = parseInt(input.value) || 0;
            } else if (action.includes('sleep')) {
                input = sleepInput;
                todayData.discipline.sleep = parseFloat(input.value) || 0;
            }
            
            if (action.includes('increase')) {
                input.stepUp();
            } else if (action.includes('decrease')) {
                input.stepDown();
            }
            
            // Обновить данные
            if (action.includes('quran')) {
                todayData.ibadat.quran = parseInt(input.value) || 0;
            } else if (action.includes('sleep')) {
                todayData.discipline.sleep = parseFloat(input.value) || 0;
            }
            
            saveData();
        });
    });
    
    // Прямое изменение числа
    quranInput.addEventListener('change', function() {
        todayData.ibadat.quran = parseInt(this.value) || 0;
        saveData();
    });
    
    sleepInput.addEventListener('change', function() {
        todayData.discipline.sleep = parseFloat(this.value) || 0;
        saveData();
    });
    
    // Чекбоксы
    azkarMorningCheckbox.addEventListener('change', function() {
        todayData.ibadat.azkarMorning = this.checked;
        saveData();
    });
    
    azkarEveningCheckbox.addEventListener('change', function() {
        todayData.ibadat.azkarEvening = this.checked;
        saveData();
    });
    
    sadakaCheckbox.addEventListener('change', function() {
        todayData.ibadat.sadaka = this.checked;
        saveData();
    });
    
    sportCheckbox.addEventListener('change', function() {
        todayData.discipline.sport = this.checked;
        saveData();
    });
    
    // Фокус дня
    focusInput.addEventListener('input', function() {
        todayData.discipline.focus = this.value;
        saveData();
    });
    
    // Салават
    counterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const amount = parseInt(this.getAttribute('data-amount'));
            todayData.ibadat.salawat += amount;
            salawatCountElement.textContent = todayData.ibadat.salawat;
            saveData();
        });
    });
    
    // Сброс салавата
    resetSalawatButton.addEventListener('click', function() {
        todayData.ibadat.salawat = 0;
        salawatCountElement.textContent = todayData.ibadat.salawat;
        saveData();
    });
    
    // Самоконтроль
    selfControlButtons.forEach(button => {
        button.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            const value = this.getAttribute('data-value');
            
            todayData.selfControl[type] = value;
            updateSelfControlButtons(type, value);
            saveData();
        });
    });
    
    // Завершение дня
    completeDayButton.addEventListener('click', function() {
        if (!todayData.completed) {
            if (confirm('Завершить день? После завершения данные нельзя будет изменить до следующего дня.')) {
                todayData.completed = true;
                saveData();
                updateUI();
                
                // Показать сообщение о завершении
                dayStatusElement.textContent = 'День завершён';
                dayStatusElement.style.color = '#27ae60';
                
                setTimeout(() => {
                    alert('День успешно завершён. Сабахун ба хайр ва барака!');
                }, 300);
            }
        }
    });
    
    // Автосохранение при изменении полей
    document.addEventListener('input', function(e) {
        if (e.target.tagName === 'INPUT' && !todayData.completed) {
            // Для полей ввода, кроме тех, которые уже обрабатываются отдельно
            if (!e.target.id.includes('quran') && 
                !e.target.id.includes('sleep') && 
                !e.target.id.includes('focus')) {
                saveData();
            }
        }
    });
    
    document.addEventListener('change', function(e) {
        if (e.target.tagName === 'INPUT' && !todayData.completed) {
            saveData();
        }
    });
    
    // ======================
    // ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
    // ======================
    
    // Загрузить данные
    loadData();
    
    // Установить автосохранение при закрытии вкладки
    window.addEventListener('beforeunload', function() {
        if (!todayData.completed) {
            saveData();
        }
    });
    
    // Показать уведомление о первом запуске
    const firstRun = !localStorage.getItem('wirdos_first_run');
    if (firstRun) {
        localStorage.setItem('wirdos_first_run', 'true');
        setTimeout(() => {
            alert('Добро пожаловать в WIRD OS. Ваши данные сохраняются автоматически и полностью офлайн.');
        }, 1000);
    }
});
