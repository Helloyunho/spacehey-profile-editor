const previewFrame = document.getElementById('previewFrame');

const liveUpdateCheck = document.getElementById('liveUpdateCheck');
const isFriendToggle = document.getElementById('isFriendToggle');

const TOKEN_MAP = {
    avatar: "{{USER_AVATAR}}",
    username: "{{USERNAME}}",

    aboutMe: "{{ABOUT_ME}}",
    whoIdLikeToMeet: "{{WHO_ID_LIKE_TO_MEET}}",

    interestsGeneral: "{{INTEREST_GENERAL}}",
    interestsMusic: "{{INTEREST_MUSIC}}",
    interestsMovies: "{{INTEREST_MOVIES}}",
    interestsTelevision: "{{INTEREST_TELEVISION}}",
    interestsBooks: "{{INTEREST_BOOKS}}",
    interestsHeroes: "{{INTEREST_HEROES}}",

    customCode: "{{CUSTOM_CODE}}",

    statusStatus: "{{STATUS_STATUS}}",
    statusMood: "{{STATUS_MOOD}}",
    statusYou: "{{STATUS_YOU}}",
};

let templateHtml = null;
let updateTimer;


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

        document.querySelectorAll('.editor .field .inputBox').forEach(inputBox => {
            if (Object.prototype.hasOwnProperty.call(values, inputBox.id)) {
                inputBox.value = values[inputBox.id];
            }
            else { inputBox.value = null; }
        });

        if (values.username) { localStorage.setItem('username', values.username); }
        if (values.avatar) { localStorage.setItem('avatar', values.avatar); }

        updatePreview();
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


function rebuild(values) {
    let preview = templateHtml;

    // Yup... this how we doing this
    preview = preview.split('{{USER_IS_FRIEND_BOX}}').join((isFriendToggle.checked) ? '<div class="profile-info"><div class="inner"><h3>{{USERNAME}} is your Friend.</h3></div></div>' : '');

    for (const [fieldId, token] of Object.entries(TOKEN_MAP)) {
        let raw = values[fieldId] ?? "";

        if (fieldId == 'statusStatus') { raw = (raw.length > 0) ? `"${raw}"` : raw; }

        preview = preview.split(token).join(raw);
    }

    return preview;
}


function updatePreview() {
    const values = {};
    
    document.querySelectorAll('.editor .field .inputBox').forEach(inputBox => { values[inputBox.id] = inputBox.value; });
    values['username'] = localStorage.getItem('username') || 'SpaceHey';
    values['avatar'] = localStorage.getItem('avatar') || './spacehey.png';

    previewFrame.srcdoc = rebuild(values);
    previewFrame.contentWindow.showFriendBox = isFriendToggle.checked;
}


function resetAvatar() {
    localStorage.removeItem('avatar');
    updatePreview();
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
                localStorage.setItem('avatar', resized.toDataURL(file.type));
                updatePreview();
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
        updatePreview();
    }
}


document.querySelectorAll('.editor .field .inputBox').forEach(inputBox => {
    inputBox.addEventListener('input', () => {
        clearTimeout(updateTimer);

        if (liveUpdateCheck.checked) {
            updateTimer = setTimeout(() => {
                updatePreview();
            }, 1000);
        }
    });
});


fetch('profile.html')
    .then(resp => resp.text())
    .then(html => {
        templateHtml = html;
        updatePreview();
    });

