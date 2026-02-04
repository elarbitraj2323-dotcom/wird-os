// WIRD OS - Stage 1.1: История дней + редактирование
// С обновленным премиальным UI

document.addEventListener('DOMContentLoaded', function() {
    // ======================
    // КОНСТАНТЫ И ПЕРЕМЕННЫЕ
    // ======================
    
    const STORAGE_KEY = 'wird_os_days';
    let currentDayData = null;
    let isEditing = false;
    let currentViewDate = null; // null = сегодня, иначе конкретная дата
    let isViewingHistory = false;
    
    // Структура данных дня
    const defaultDayData = {
        date: null,
        status: 'active', // 'active' или 'completed'
        updatedAt: null,
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
            language: null,
            gaze: null,
            anger: null
        }
    };
    
    // Массив аятов и мотивационных цитат
    const dailyQuotes = [
        { text: "Воистину, с тягостью приходит облегчение.", source: "Коран 94:6" },
        { text: "Аллах не меняет положения людей, пока они не изменят самих себя.", source: "Коран 13:11" },
        { text: "Поминайте Меня, и Я буду помнить о вас.", source: "Коран 2:152" },
        { text: "Сердце верующего находится между двумя пальцами Милостивого.", source: "Хадис" },
        { text: "Терпение — это свет.", source: "Хадис" },
        { text: "Лучшие из вас — те, кто приносит наибольшую пользу другим.", source: "Хадис" },
        { text: "Совершай благие дела так, будто ты видишь Аллаха, и если ты не видишь Его, то Он видит тебя.", source: "Хадис" },
        { text: "Улыбка брату твоему — милостыня.", source: "Хадис" },
        { text: "Верующий подобен пчеле: питается только чистым и производит только чистое.", source: "Исламская мудрость" },
        { text: "Дисциплина сегодня — свобода завтра.", source: "Исламская мудрость" },
        { text: "Наилучшие дела — постоянные, даже если они малы.", source: "Хадис" },
        { text: "Помни о смерти — это отрезвляет душу.", source: "Исламская мудрость" },
        { text: "Терпение в момент гнева предотвращает тысячи сожалений.", source: "Исламская мудрость" },
        { text: "Знание — потерянное сокровище верующего, он вправе забрать его где бы ни нашел.", source: "Хадис" },
        { text: "Самый сильный — не тот, кто побеждает других, а тот, кто побеждает себя в гневе.", source: "Хадис" },
        { text: "Совершай молитву, и она станет светом в твоем сердце.", source: "Исламская мудрость" },
        { text: "Аллах любит, когда дела ваши совершаются тщательно.", source: "Хадис" },
        { text: "Молчание — мудрость, но мало кто его придерживается.", source: "Исламская мудрость" },
        { text: "Верующий не укушается дважды из одной норы.", source: "Хадис" },
        { text: "Будь в этом мире как странник или путник.", source: "Хадис" }
    ];
    
    // ======================
    // ИНИЦИАЛИЗАЦИЯ АНИМАЦИИ ФОНА
    // ======================
    
    function initBackgroundAnimation() {
        // Проверяем настройки prefers-reduced-motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (!prefersReducedMotion) {
            // Добавляем параллакс эффект для blobs при движении мыши
            document.addEventListener('mousemove', (e) => {
                const x = e.clientX / window.innerWidth;
                const y = e.clientY / window.innerHeight;
                
                const blobs = document.querySelectorAll('.blob');
                blobs.forEach((blob, index) => {
                    const speed = 0.3 + (index * 0.1);
                    const moveX = (x - 0.5) * 40 * speed;
                    const moveY = (y - 0.5) * 40 * speed;
                    
                    blob.style.transform = `translate(${moveX}px, ${moveY}px)`;
                });
            });
            
            // Анимация градиента сетки
            const grid = document.querySelector('.background-grid');
            let gridAngle = 0;
            
            function animateGrid() {
                gridAngle = (gridAngle + 0.05) % 360;
                grid.style.backgroundImage = 
                    `linear-gradient(${gridAngle}deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px),
                     linear-gradient(${gridAngle + 90}deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px)`;
                requestAnimationFrame(animateGrid);
            }
            
            animateGrid();
        }
    }
    
    // ======================
    // ЭЛЕМЕНТЫ ДОМ
    // ======================
    
    // Экран
    const todayScreen = document.getElementById('todayScreen');
    const historyScreen = document.getElementById('historyScreen');
    
    // Навигация
    const historyBtn = document.getElementById('historyBtn');
    const backToTodayBtn = document.getElementById('backToTodayBtn');
    
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
    
    // Кнопки действий
    const completeDayButton = document.getElementById('completeDayBtn');
    const editDayButton = document.getElementById('editDayBtn');
    const saveChangesButton = document.getElementById('saveChangesBtn');
    const cancelEditButton = document.getElementById('cancelEditBtn');
    const deleteDayButton = document.getElementById('deleteDayBtn');
    const copyYesterdayButton = document.getElementById('copyYesterdayBtn');
    
    // Статусы
    const dayStatusElement = document.getElementById('dayStatus');
    const viewingHistoryIndicator = document.getElementById('viewingHistoryIndicator');
    
    // История
    const daysList = document.getElementById('daysList');
    const totalDaysCount = document.getElementById('totalDaysCount');
    const completedDaysCount = document.getElementById('completedDaysCount');
    
    // ======================
    // УТИЛИТЫ
    // ======================
    
    // Получить текущую дату в формате YYYY-MM-DD
    function getTodayDateString() {
        const now = new Date();
        return formatDate(now);
    }
    
    // Форматировать дату в YYYY-MM-DD
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    // Форматирование даты для отображения
    function formatDateForDisplay(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('ru-RU', options);
    }
    
    // Получить вчерашнюю дату
    function getYesterdayDateString() {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return formatDate(yesterday);
    }
    
    // Получить индекс для выбора цитаты дня
    function getQuoteIndexForDate(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        return dayOfYear % dailyQuotes.length;
    }
    
    // Загрузить все дни из localStorage
    function loadAllDays() {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    }
    
    // Сохранить все дни в localStorage
    function saveAllDays(days) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(days));
    }
    
    // Получить данные дня
    function getDayData(dateString) {
        const days = loadAllDays();
        return days[dateString] || null;
    }
    
    // Сохранить данные дня
    function saveDayData(dateString, data) {
        const days = loadAllDays();
        data.updatedAt = new Date().toISOString();
        days[dateString] = data;
        saveAllDays(days);
    }
    
    // Удалить данные дня
    function deleteDayData(dateString) {
        const days = loadAllDays();
        delete days[dateString];
        saveAllDays(days);
    }
    
    // Получить список дней отсортированный по дате (новые первые)
    function getSortedDays() {
        const days = loadAllDays();
        return Object.keys(days)
            .sort((a, b) => b.localeCompare(a))
            .map(date => ({ date, ...days[date] }));
    }
    
    // Показать уведомление
    function showNotification(message, type = 'info') {
        const status = dayStatusElement;
        const originalText = status.textContent;
        
        status.textContent = message;
        
        if (type === 'success') {
            status.style.color = 'var(--color-success)';
        } else if (type === 'error') {
            status.style.color = 'var(--color-failure)';
        } else {
            status.style.color = 'var(--color-secondary)';
        }
        
        setTimeout(() => {
            if (currentDayData) {
                status.textContent = currentDayData.status === 'completed' ? 'День завершён' : 'День активен';
                status.style.color = currentDayData.status === 'completed' ? 'var(--color-success)' : 'var(--color-secondary)';
            }
        }, 2000);
    }
    
    // ======================
    // УПРАВЛЕНИЕ ЭКРАНАМИ
    // ======================
    
    // Показать экран истории
    function showHistoryScreen() {
        todayScreen.style.display = 'none';
        historyScreen.style.display = 'block';
        updateHistoryScreen();
    }
    
    // Показать экран сегодня
    function showTodayScreen(dateString = null) {
        historyScreen.style.display = 'none';
        todayScreen.style.display = 'block';
        
        currentViewDate = dateString || getTodayDateString();
        isViewingHistory = !!dateString;
        
        loadDay(currentViewDate);
        updateUI();
    }
    
    // Обновить экран истории
    function updateHistoryScreen() {
        const days = getSortedDays();
        const total = days.length;
        const completed = days.filter(day => day.status === 'completed').length;
        
        // Обновить статистику
        totalDaysCount.textContent = `${total}`;
        completedDaysCount.textContent = `${completed}`;
        
        // Показать/скрыть кнопку "Копировать вчерашний день"
        const yesterday = getYesterdayDateString();
        const yesterdayData = getDayData(yesterday);
        copyYesterdayButton.style.display = yesterdayData ? 'flex' : 'none';
        
        // Очистить список
        daysList.innerHTML = '';
        
        if (days.length === 0) {
            daysList.innerHTML = `
                <div class="empty-history">
                    <div class="empty-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                    </div>
                    <h3>История пуста</h3>
                    <p>Здесь будут появляться ваши завершённые и активные дни</p>
                </div>
            `;
            return;
        }
        
        // Добавить дни в список
        days.forEach(day => {
            const dayCard = document.createElement('div');
            dayCard.className = 'day-card glass-card';
            dayCard.dataset.date = day.date;
            
            // Создать сводку
            const summary = createDaySummary(day);
            
            dayCard.innerHTML = `
                <div class="day-card-header">
                    <div class="day-card-date">${formatDateForDisplay(day.date)}</div>
                    <div class="day-card-status ${day.status === 'completed' ? 'status-completed' : 'status-active'}">
                        ${day.status === 'completed' ? 'Завершён' : 'Активен'}
                    </div>
                </div>
                <div class="day-card-summary">
                    ${summary}
                </div>
            `;
            
            dayCard.addEventListener('click', () => {
                showTodayScreen(day.date);
            });
            
            daysList.appendChild(dayCard);
        });
    }
    
    // Создать сводку дня для истории
    function createDaySummary(day) {
        const items = [
            { 
                icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
                text: `Коран: ${day.ibadat.quran}`
            },
            { 
                icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>',
                text: `Салават: ${day.ibadat.salawat}`
            },
            { 
                icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>',
                text: `Сон: ${day.discipline.sleep}ч`
            },
            { 
                icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
                text: `Спорт: ${day.discipline.sport ? 'Да' : 'Нет'}`
            },
            { 
                icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
                text: `Садака: ${day.ibadat.sadaka ? 'Да' : 'Нет'}`
            },
            { 
                icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
                text: `Азкар: ${day.ibadat.azkarMorning ? 'У' : ''}${day.ibadat.azkarEvening ? 'В' : ''}`
            }
        ];
        
        return items.map(item => `
            <div class="summary-item">
                <span class="summary-icon">${item.icon}</span>
                <span>${item.text}</span>
            </div>
        `).join('');
    }
    
    // ======================
    // УПРАВЛЕНИЕ ДНЕМ
    // ======================
    
    // Загрузить день
    function loadDay(dateString) {
        const today = getTodayDateString();
        const isToday = dateString === today;
        
        // Получить данные дня
        let dayData = getDayData(dateString);
        
        if (!dayData) {
            // Создать новый день
            dayData = { ...defaultDayData };
            dayData.date = dateString;
            dayData.status = 'active';
            
            // Если это сегодня, попробовать скопировать вчера
            if (isToday) {
                const yesterdayData = getDayData(getYesterdayDateString());
                if (yesterdayData) {
                    // Копировать только значения, не статус
                    dayData.ibadat = { ...yesterdayData.ibadat };
                    dayData.discipline = { ...yesterdayData.discipline };
                    dayData.selfControl = { ...yesterdayData.selfControl };
                    dayData.ibadat.salawat = 0; // Сбросить салават
                }
            }
            
            saveDayData(dateString, dayData);
        }
        
        currentDayData = dayData;
        
        // Обновить дату в заголовке
        currentDateElement.textContent = formatDateForDisplay(dateString);
        
        // Установить аят/цитату дня
        const quoteIndex = getQuoteIndexForDate(dateString);
        dailyQuoteText.textContent = dailyQuotes[quoteIndex].text;
        dailyQuoteSource.textContent = dailyQuotes[quoteIndex].source;
        
        // Обновить поля формы
        updateFormFromData();
        
        // Обновить UI в зависимости от статуса
        updateUI();
    }
    
    // Обновить форму из данных
    function updateFormFromData() {
        if (!currentDayData) return;
        
        // Ибадат
        quranInput.value = currentDayData.ibadat.quran;
        azkarMorningCheckbox.checked = currentDayData.ibadat.azkarMorning;
        azkarEveningCheckbox.checked = currentDayData.ibadat.azkarEvening;
        salawatCountElement.textContent = currentDayData.ibadat.salawat;
        sadakaCheckbox.checked = currentDayData.ibadat.sadaka;
        
        // Дисциплина
        sleepInput.value = currentDayData.discipline.sleep;
        sportCheckbox.checked = currentDayData.discipline.sport;
        focusInput.value = currentDayData.discipline.focus;
        
        // Самоконтроль
        updateSelfControlButtons('language', currentDayData.selfControl.language);
        updateSelfControlButtons('gaze', currentDayData.selfControl.gaze);
        updateSelfControlButtons('anger', currentDayData.selfControl.anger);
    }
    
    // Обновить данные из формы
    function updateDataFromForm() {
        if (!currentDayData) return;
        
        // Ибадат
        currentDayData.ibadat.quran = parseInt(quranInput.value) || 0;
        currentDayData.ibadat.azkarMorning = azkarMorningCheckbox.checked;
        currentDayData.ibadat.azkarEvening = azkarEveningCheckbox.checked;
        currentDayData.ibadat.sadaka = sadakaCheckbox.checked;
        
        // Дисциплина
        currentDayData.discipline.sleep = parseFloat(sleepInput.value) || 0;
        currentDayData.discipline.sport = sportCheckbox.checked;
        currentDayData.discipline.focus = focusInput.value;
    }
    
    // Обновить кнопки самоконтроля
    function updateSelfControlButtons(type, value) {
        document.querySelectorAll(`[data-type="${type}"]`).forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (value) {
            const activeBtn = document.querySelector(`[data-type="${type}"][data-value="${value}"]`);
            if (activeBtn) {
                activeBtn.classList.add('active');
            }
        }
    }
    
    // Обновить UI
    function updateUI() {
        if (!currentDayData) return;
        
        const isToday = currentViewDate === getTodayDateString();
        const isCompleted = currentDayData.status === 'completed';
        
        // Показать/скрыть индикатор просмотра истории
        viewingHistoryIndicator.style.display = isViewingHistory ? 'flex' : 'none';
        
        // Обновить статус дня
        dayStatusElement.textContent = isCompleted ? 'День завершён' : 'День активен';
        dayStatusElement.style.color = isCompleted ? 'var(--color-success)' : 'var(--color-secondary)';
        
        // Управление блокировкой полей
        const shouldLockFields = isCompleted && !isEditing;
        
        // Блокировать/разблокировать поля
        quranInput.disabled = shouldLockFields;
        azkarMorningCheckbox.disabled = shouldLockFields;
        azkarEveningCheckbox.disabled = shouldLockFields;
        sadakaCheckbox.disabled = shouldLockFields;
        sleepInput.disabled = shouldLockFields;
        sportCheckbox.disabled = shouldLockFields;
        focusInput.disabled = shouldLockFields;
        
        // Блокировать кнопки
        document.querySelectorAll('.number-btn, .counter-btn, .counter-reset, .toggle-btn').forEach(btn => {
            btn.disabled = shouldLockFields;
        });
        
        // Управление кнопками действий
        completeDayButton.style.display = (!isCompleted && isToday && !isEditing) ? 'flex' : 'none';
        editDayButton.style.display = (isCompleted && !isEditing) ? 'flex' : 'none';
        saveChangesButton.style.display = (isEditing) ? 'flex' : 'none';
        cancelEditButton.style.display = (isEditing) ? 'flex' : 'none';
        deleteDayButton.style.display = (isViewingHistory && !isEditing) ? 'flex' : 'none';
        
        // Заблокировать кнопку завершения дня если сегодня уже завершён
        if (isCompleted && isToday) {
            completeDayButton.disabled = true;
            completeDayButton.innerHTML = '<span class="btn-text">День завершён</span><span class="btn-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg></span>';
        } else {
            completeDayButton.disabled = false;
            completeDayButton.innerHTML = '<span class="btn-text">Завершить день</span><span class="btn-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg></span>';
        }
    }
    
    // Включить режим редактирования
    function enableEditMode() {
        isEditing = true;
        
        // Разблокировать все поля
        quranInput.disabled = false;
        azkarMorningCheckbox.disabled = false;
        azkarEveningCheckbox.disabled = false;
        sadakaCheckbox.disabled = false;
        sleepInput.disabled = false;
        sportCheckbox.disabled = false;
        focusInput.disabled = false;
        
        document.querySelectorAll('.number-btn, .counter-btn, .counter-reset, .toggle-btn').forEach(btn => {
            btn.disabled = false;
        });
        
        updateUI();
    }
    
    // Отключить режим редактирования
    function disableEditMode() {
        isEditing = false;
        updateFormFromData(); // Восстановить исходные значения
        updateUI();
    }
    
    // Сохранить изменения
    function saveChanges() {
        if (!currentDayData) return;
        
        updateDataFromForm();
        saveDayData(currentViewDate, currentDayData);
        
        isEditing = false;
        updateUI();
        
        showNotification('Изменения сохранены', 'success');
    }
    
    // Завершить день
    function completeDay() {
        if (!currentDayData) return;
        
        if (confirm('Завершить день? После завершения вы сможете редактировать его через историю.')) {
            updateDataFromForm();
            currentDayData.status = 'completed';
            currentDayData.updatedAt = new Date().toISOString();
            
            saveDayData(currentViewDate, currentDayData);
            updateUI();
            
            showNotification('День успешно завершён', 'success');
        }
    }
    
    // Удалить день
    function deleteDay() {
        if (!currentDayData) return;
        
        if (confirm(`Удалить запись за ${formatDateForDisplay(currentViewDate)}? Это действие нельзя отменить.`)) {
            deleteDayData(currentViewDate);
            showNotification('Запись удалена', 'success');
            showHistoryScreen();
        }
    }
    
    // Копировать вчерашний день
    function copyYesterday() {
        const yesterdayData = getDayData(getYesterdayDateString());
        if (!yesterdayData) return;
        
        if (confirm('Скопировать значения из вчерашнего дня?')) {
            // Копировать только значения, не статус
            currentDayData.ibadat = { ...yesterdayData.ibadat };
            currentDayData.discipline = { ...yesterdayData.discipline };
            currentDayData.selfControl = { ...yesterdayData.selfControl };
            currentDayData.ibadat.salawat = 0; // Сбросить салават
            
            updateFormFromData();
            saveDayData(currentViewDate, currentDayData);
            
            showNotification('Данные скопированы', 'success');
        }
    }
    
    // ======================
    // ОБРАБОТЧИКИ СОБЫТИЙ
    // ======================
    
    // Навигация
    historyBtn.addEventListener('click', showHistoryScreen);
    backToTodayBtn.addEventListener('click', () => showTodayScreen(getTodayDateString()));
    
    // Изменение чисел (Коран, Сон)
    numberButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            let input;
            
            if (action.includes('quran')) {
                input = quranInput;
            } else if (action.includes('sleep')) {
                input = sleepInput;
            }
            
            if (action.includes('increase')) {
                input.stepUp();
            } else if (action.includes('decrease')) {
                input.stepDown();
            }
            
            saveChanges();
        });
    });
    
    // Прямое изменение чисел
    quranInput.addEventListener('change', saveChanges);
    sleepInput.addEventListener('change', saveChanges);
    
    // Чекбоксы
    azkarMorningCheckbox.addEventListener('change', saveChanges);
    azkarEveningCheckbox.addEventListener('change', saveChanges);
    sadakaCheckbox.addEventListener('change', saveChanges);
    sportCheckbox.addEventListener('change', saveChanges);
    
    // Фокус дня
    focusInput.addEventListener('input', saveChanges);
    
    // Салават
    counterButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (!currentDayData) return;
            
            const amount = parseInt(this.getAttribute('data-amount'));
            currentDayData.ibadat.salawat += amount;
            salawatCountElement.textContent = currentDayData.ibadat.salawat;
            
            saveChanges();
        });
    });
    
    // Сброс салавата
    resetSalawatButton.addEventListener('click', function() {
        if (!currentDayData) return;
        
        currentDayData.ibadat.salawat = 0;
        salawatCountElement.textContent = currentDayData.ibadat.salawat;
        
        saveChanges();
    });
    
    // Самоконтроль
    selfControlButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (!currentDayData) return;
            
            const type = this.getAttribute('data-type');
            const value = this.getAttribute('data-value');
            
            currentDayData.selfControl[type] = value;
            updateSelfControlButtons(type, value);
            
            saveChanges();
        });
    });
    
    // Кнопки действий
    editDayButton.addEventListener('click', enableEditMode);
    saveChangesButton.addEventListener('click', saveChanges);
    cancelEditButton.addEventListener('click', disableEditMode);
    completeDayButton.addEventListener('click', completeDay);
    deleteDayButton.addEventListener('click', deleteDay);
    copyYesterdayButton.addEventListener('click', copyYesterday);
    
    // Автосохранение
    let saveTimeout;
    document.addEventListener('input', function(e) {
        if (e.target.tagName === 'INPUT' && !isEditing && currentDayData?.status === 'active') {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                updateDataFromForm();
                saveDayData(currentViewDate, currentDayData);
                showNotification('Сохранено', 'success');
            }, 1000);
        }
    });
    
    // ======================
    // ИНИЦИАЛИЗАЦИЯ
    // ======================
    
    // Инициализировать анимацию фона
    initBackgroundAnimation();
    
    // Загрузить текущий день
    loadDay(getTodayDateString());
    
    // Установить автосохранение при закрытии вкладки
    window.addEventListener('beforeunload', function() {
        if (currentDayData && currentDayData.status === 'active') {
            updateDataFromForm();
            saveDayData(currentViewDate, currentDayData);
        }
    });
    
    // Показать уведомление о первом запуске
    const firstRun = !localStorage.getItem('wirdos_first_run');
    if (firstRun) {
        localStorage.setItem('wirdos_first_run', 'true');
        setTimeout(() => {
            const notification = document.createElement('div');
            notification.className = 'glass-card';
            notification.style.position = 'fixed';
            notification.style.bottom = '20px';
            notification.style.left = '50%';
            notification.style.transform = 'translateX(-50%)';
            notification.style.padding = 'var(--spacing-md) var(--spacing-lg)';
            notification.style.zIndex = '1000';
            notification.style.maxWidth = '400px';
            notification.style.textAlign = 'center';
            notification.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
            notification.innerHTML = `
                <p style="margin-bottom: var(--spacing-sm); font-weight: 500;">Добро пожаловать в WIRD OS</p>
                <p style="font-size: 0.9rem; opacity: 0.8;">Теперь вы можете просматривать и редактировать историю дней</p>
            `;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(-50%) translateY(20px)';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }, 1000);
    }
});
