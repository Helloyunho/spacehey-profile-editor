const previewFrame = document.getElementById('previewFrame');

const liveUpdateCheck = document.getElementById('liveUpdateCheck');
const isFriendToggle = document.getElementById('isFriendToggle');
const ownerToggle = document.getElementById('ownerToggle');
const userToggle = document.getElementById('userToggle');

window.customArgs = {
    ownerMode: ownerToggle.checked,
    showFriendBox: isFriendToggle.checked,
    userMode: userToggle.checked || ownerToggle.checked,
}

const DEFAULT_USERNAME = 'SpaceHey'
const DEFAULT_AVATAR = './image/spacehey.png'

const frameQuerySelector = selector => previewFrame.contentWindow.document.querySelector(selector)

const TOKEN_MAP = {
    avatar: src => {
        frameQuerySelector('.general-about>.profile-pic>.pfp-fallback').src = src
    },
    username: username => {
        frameQuerySelector('span[itemprop="name"]>h1').innerText = username
        frameQuerySelector('.contact>.heading>h4').innerText = `Contacting ${username}`
        frameQuerySelector('#THIS_IS_NOT_IN_SPACEHEY_interests').innerText = `${username}'s Interests`
        frameQuerySelector('#THIS_IS_NOT_IN_SPACEHEY_links').innerText = `${username}'s Links`
        const innerH3 = frameQuerySelector('.profile-info>.inner>h3')
        if (innerH3) {
            innerH3.innerText = `${username} is your Friend.`
        }
        const blogPreviewH4 = frameQuerySelector('.blog-preview>h4')
        blogPreviewH4.childNodes[0].textContent = `${username}'s Latest Blog Entries [`
        frameQuerySelector('.blurbs>.heading>h4').innerText = `${username}'s Blurbs`
        frameQuerySelector('.col.right>.friends:not([id="comments"])>.heading>h4').innerText = `${username}'s Friend Space`
        const friendInner = frameQuerySelector('.col.right>.friends:not([id="comments"])>.inner>p>b')
        friendInner.childNodes[0].textContent = `${username} has `
        frameQuerySelector('.col.right>.friends[id="comments"]>.heading>h4').innerText = `${username}'s Friends Comments`
    },

    aboutMe: aboutMe => {
        frameQuerySelector('.blurbs>.inner>div:first-child>p[itemprop="description"]').innerHTML = aboutMe
    },
    whoIdLikeToMeet: meet => {
        frameQuerySelector('.blurbs>.inner>div:nth-child(2)>p').innerHTML = meet
    },

    interestsGeneral: general => {
        frameQuerySelector('#THIS_IS_NOT_IN_SPACEHEY_interestGeneral').innerHTML = general
    },
    interestsMusic: music => {
        frameQuerySelector('#THIS_IS_NOT_IN_SPACEHEY_interestMusic').innerHTML = music
    },
    interestsMovies: movies => {
        frameQuerySelector('#THIS_IS_NOT_IN_SPACEHEY_interestMovies').innerHTML = movies
    },
    interestsTelevision: television => {
        frameQuerySelector('#THIS_IS_NOT_IN_SPACEHEY_interestTelevision').innerHTML = television
    },
    interestsBooks: books => {
        frameQuerySelector('#THIS_IS_NOT_IN_SPACEHEY_interestBooks').innerHTML = books
    },
    interestsHeroes: heroes => {
        frameQuerySelector('#THIS_IS_NOT_IN_SPACEHEY_interestHeroes').innerHTML = heroes
    },

    customCode: code => {
        frameQuerySelector('#code').innerHTML = code
    },

    statusStatus: status => {
        frameQuerySelector('.general-about>.details>p:first-child').innerText = status ? `"${status}"` : ''
    },
    statusMood: mood => {
        frameQuerySelector('.mood>p').childNodes[2].textContent = ` ${mood}`
    },
    statusYou: you => {
        frameQuerySelector('.general-about>.details>p:nth-child(2)').innerText = you
    },
};


const resetFrame = () => {
    document.querySelectorAll('.editor .field .inputBox').forEach(inputBox => {
        TOKEN_MAP[inputBox.id](inputBox.value ?? '')
    });
    TOKEN_MAP.avatar(localStorage.getItem('avatar') ?? DEFAULT_AVATAR)
    TOKEN_MAP.username(localStorage.getItem('username') ?? DEFAULT_USERNAME)
}

function updateArgs () {
    window.customArgs = {
        ownerMode: ownerToggle.checked,
        showFriendBox: isFriendToggle.checked,
        userMode: userToggle.checked || ownerToggle.checked,
    }
    previewFrame.contentWindow.location.reload()
}


function configLoad(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.type !== 'application/json') {
        alert('Invalid type... please try again!');
        return;
    }

    const reader = new FileReader();

    reader.onload = function() {
        let values;

        try { values = JSON.parse(reader.result); }
        catch (error) {
            alert('Failed to load config file... please try a different file!\nReport this to the developer if you believe this is incorrect...');
            console.log(error);
            return;
        }

        Object.entries(TOKEN_MAP).forEach(([key, updater]) => {
            const inputBox = document.getElementById(key) ?? {value: ''}
            if (key in values) {
                inputBox.value = values[key];
                updater(values[key])
            } else {
                inputBox.value = null;
                updater('')
            }
        })

        if (values.username) { localStorage.setItem('username', values.username); TOKEN_MAP.username(values.username) }
        if (values.avatar) { localStorage.setItem('avatar', values.avatar); TOKEN_MAP.avatar(values.avatar) }
    };

    reader.onerror = function() {
        alert('Failed to load config file... please try a different file!\nReport this to the developer if you believe this is incorrect...');
        console.log(reader.error);
    }

    reader.readAsText(file);
    event.target.value = '';
}


function configSave() {
    const values = {};
    document.querySelectorAll('.editor .field .inputBox').forEach(inputBox => { values[inputBox.id] = inputBox.value; });

    values['username'] = localStorage.getItem('username');
    values['avatar'] = localStorage.getItem('avatar');

    const blob = new Blob([JSON.stringify(values, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const file = document.createElement('a');
    file.href = url;
    file.download = 'spacehey-profile-config.json';
    
    document.body.appendChild(file);
    file.click();
    document.body.removeChild(file);

    URL.revokeObjectURL(url);
}


function resetAvatar() {
    localStorage.removeItem('avatar');
    TOKEN_MAP.avatar(DEFAULT_AVATAR)
}


function updateAvatar(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
        alert('Invalid image type... please try again!');
        return;
    }

    const reader = new FileReader();

    reader.onload = function() {
        const newAvatar = new Image();

        newAvatar.onload = function() {
            const scale = Math.min(
                300 / newAvatar.width,
                300 / newAvatar.height,
                1
            );

            const resized = document.createElement('canvas');
            resized.width = Math.round(newAvatar.width * scale);
            resized.height = Math.round(newAvatar.height * scale);

            const ctx = resized.getContext('2d');
            ctx.drawImage(newAvatar, 0, 0, resized.width, resized.height);

            try {
                const dataURL = resized.toDataURL(file.type)
                localStorage.setItem('avatar', dataURL);
                TOKEN_MAP.avatar(dataURL)
            }
            catch (error) {
                alert('Failed to update avatar... please try a different image!');
                console.error(error);
            }
        };

        newAvatar.src = reader.result;
    };

    reader.readAsDataURL(file);
    event.target.value = '';
}


function updateUsername(name) {
    const username = name || prompt('Enter a username to set:');

    if (username !== null) {
        localStorage.setItem('username', username);
        TOKEN_MAP.username(username)
    }
}


document.querySelectorAll('.editor .field .inputBox').forEach(inputBox => {
    inputBox.addEventListener('input', (e) => {
        liveUpdateCheck.checked && TOKEN_MAP[inputBox.id](e.target.value)
    });
});


previewFrame.addEventListener('load', () => {
    resetFrame()
})


fetch('profile.html')
    .then(resp => resp.text())
    .then(html => {
        previewFrame.srcdoc = html
    });
