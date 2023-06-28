'use strict';

let habbits = [];
const HABBIT_KEY = 'HABBIT_KEY';
let globalActiveHabbitId;

/* page */
const page = {
    menu: document.querySelector('.sidebar__nav'),
    header: {
        habbitTitle: document.querySelector('.header__title'),
        progressPercent: document.querySelector('.progress__percent'),
        progressBar: document.querySelector('.progress__cover-bar')
    },
    // habbit: {
    //     habbitItem: document.querySelector('.habbit__item'),
    //     habbitDay: document.querySelector('.habbit__day'),
    //     habbitСomment: document.querySelector('.habbit__day')
    // }
    habbit: {
        habbitList: document.querySelector('.habbit__wrp')
    },
    form: {
        formDay: document.getElementById('form-day'),
        errorMsg: document.querySelector('.error-msg')
    },
    popup: {
        popupWindow: document.querySelector('.pop-up__wrp'),
        iconField: document.querySelector('.new-habbit__form input[name="icon"]')
    }
};

/* utils */
function loadData() {
    const habbitsString = localStorage.getItem(HABBIT_KEY);
    const habbitArray = JSON.parse(habbitsString);

    if (Array.isArray(habbitArray)) {
        habbits = habbitArray;
    }
}

function saveData() {
    localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
}

function resetForm(form, fields) {
    for (const field of fields) {
        form[field].value = '';
    }
}

function validateAndGetFormData(form, fields) {
    const formData = new FormData(form);
    const res = {};
    for (const field of fields) {
        const fieldValue = formData.get(field);
        form[field].classList.remove('error');
        // page.form.errorMsg.classList.remove('show-msg');
        if (!fieldValue) {
        
            form[field].classList.add('error');
            // page.form.errorMsg.classList.add('show-msg');
    
            // return;
        }
        res[field] = fieldValue;
    }

    let isValid = true;
    for (const field of fields) {
        if (!res[field]) {
            isValid = false;
        }
    }
    if (!isValid) {
        return;
    }
    return res;
}

/* render */
function rerenderMenu(activeHabbit) {

    for (const habbit of habbits) {
        const existed = document.querySelector(`[menu-habbit-id="${habbit.id}"]`);
        if (!existed) {
            // создание
            const element = document.createElement('button');
            element.setAttribute('menu-habbit-id', habbit.id);
            element.classList.add('nav__btn');
            element.addEventListener('click', () => rerender(habbit.id));

            element.innerHTML = `<img src="./img/${habbit.icon}.svg" alt="${habbit.name}">`;

            if (activeHabbit.id === habbit.id) {
                element.classList.add('active');
            }

            page.menu.appendChild(element);

            continue;
        }
        if (activeHabbit.id === habbit.id) {
            existed.classList.add('active');
        } else {
            existed.classList.remove('active');
        }
    }
}

function rerenderHead(activeHabbit) {
    // title
    page.header.habbitTitle.innerText = activeHabbit.name;

    const progress = activeHabbit.days.length / activeHabbit.target > 1 
        ? 100 
        : activeHabbit.days.length / activeHabbit.target * 100;

    page.header.progressPercent.innerText = `${progress.toFixed(0)}%`;

    page.header.progressBar.setAttribute('style', `width: ${progress.toFixed(0)}%`);
}

function rerenderBody(activeHabbit) {
    page.habbit.habbitList.innerHTML = '';

    for (const day in activeHabbit.days) {
        const habbit = document.createElement('div');
        habbit.classList.add('habbit__item');
        habbit.innerHTML = `
            <!-- habbit -->
            <div class="habbit__day">День ${Number(day) + 1}</div>
            <div class="habbit__comment-wrp">
                <div class="habbit__comment">
                    ${activeHabbit.days[day].comment}
                </div>
                <button class="habbit__del-btn" onclick="deleteDay(${day})" title="Удалить День ${Number(day) + 1}">
                    <img src="./img/delete.svg" alt="Удалить День ${Number(day) + 1}">
                </button>
            </div>
            <!-- /habbit -->
        `;

        page.habbit.habbitList.appendChild(habbit);
    }

    page.form.formDay.innerText = `День ${activeHabbit.days.length + 1}`;
}

function rerender(activeHabbitId) {
    globalActiveHabbitId = activeHabbitId;
    const activeHabbit = habbits.find(habbit => habbit.id === activeHabbitId);
   
    if (!activeHabbit) {
        return;
    }

    document.location.replace(document.location.pathname + '#' + activeHabbitId);

    rerenderMenu(activeHabbit);
    rerenderHead(activeHabbit);
    rerenderBody(activeHabbit);
}

/* work with days */
function addDays(event) {
    event.preventDefault();

    const data = validateAndGetFormData(event.target, ['comment']);

    if (!data) {
        return;
    }

    habbits = habbits.map(habbit => {
        if (habbit.id === globalActiveHabbitId) {
            return {
                ...habbit,
                days: habbit.days.concat([{ comment: data.comment }])
            };
        }
        return habbit;
    });

    resetForm(event.target, ['comment']);
    rerender(globalActiveHabbitId);
    saveData();
} 

function deleteDay(index) {
    habbits = habbits.map(habbit => {
        if (habbit.id === globalActiveHabbitId) {
            habbit.days.splice(index, 1);

            return {
                ...habbit,
                days: habbit.days
            };
        }

        return habbit;
    });

    rerender(globalActiveHabbitId);
    saveData();
}

function toglePopupWindow() {
    page.popup.popupWindow.classList.toggle('show'); 
}

function setIcon(context, icon) {
    page.popup.iconField.value = icon;
    const activeIcon = document.querySelector('.icons__button.active');
    activeIcon.classList.remove('active');
    context.classList.add('active');
}

function addHabbit(event) {
    event.preventDefault();
    const data = validateAndGetFormData(event.target, ['icon', 'name', 'target']);

    if (!data) {
        return;
    }
    const maxId  = habbits.reduce((acc, habbit) => acc > habbit.id ? acc : habbit.id, 0);
    habbits.push({
        "id": maxId + 1,
        "icon": data.icon,
        "name": data.name,
        "target": data.target,
        "days": []
    });

    resetForm(event.target, ['name', 'target']);
    toglePopupWindow();
    saveData();
    rerender(maxId + 1);
}


/* init */
(() => {
    loadData();
    const hashId = Number(document.location.hash.replace('#', ''));
    const urlHabbit = habbits.find(habbit => habbit.id == hashId);

    if (urlHabbit) {
        rerender(urlHabbit.id);
    } else {
        rerender(habbits[0].id);
    }
    
})();
