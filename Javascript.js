const firebaseConfig = {
    apiKey: "AIzaSyDcoyMk0dEwaC-JQaWmjRnzk9qxRMoVjUk",
    authDomain: "lsq-traduction.firebaseapp.com",
    databaseURL: "https://lsq-traduction-default-rtdb.firebaseio.com",
    projectId: "lsq-traduction",
    storageBucket: "lsq-traduction.appspot.com",
    messagingSenderId: "150479486832",
    appId: "1:150479486832:web:a3b32f7b10cede5a3b99b5",
    measurementId: "G-6F3V6RYLL7"
};
firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();
var storage=firebase.storage();

document.addEventListener('DOMContentLoaded', function () {
    

    document.getElementById('word').addEventListener('input', function () {
    const query = this.value.trim().toLowerCase();
    if (handleRadioClick('DefinitionVid') || handleRadioClick('TraductionVid')) {
        const suggestionsList = document.getElementById('suggestions');
        suggestionsList.innerHTML = '';

        if (query.length >= 1) {
            console.log('Fetching suggestions from Firestore and Firebase Storage...');

            // Reference to the "words" collection in Firestore
            const wordsCollectionRef = firestore.collection('words');

            // Query Firestore for words
            const firestorePromise = wordsCollectionRef
                .orderBy('word')
                .startAt(query)
                .endAt(query + '\uf8ff')
                .limit(5)
                .get()
                .then(function (result) {
                    // Filter documents that contain the query in their "word" field
                    const matchingWords = result.docs.filter(doc => {
                        const word = doc.data().word.toLowerCase();
                        return word.includes(query);
                    });

                    console.log('Firestore suggestions fetched successfully!', matchingWords);

                    // Display Firestore suggestions or no word message
                    if (matchingWords.length > 0) {
                        matchingWords.slice(0, 5).forEach(doc => {
                            const word = doc.data().word;
                            const suggestionItem = document.createElement('li');
                            suggestionItem.textContent = word;
                            suggestionsList.appendChild(suggestionItem);
                        });
                    } else {
                        const noWordItem = document.createElement('li');
                        noWordItem.textContent = 'No words found';
                        suggestionsList.appendChild(noWordItem);
                    }

                    // Add event listener for each Firestore suggestion
                    suggestionsList.querySelectorAll('li').forEach(suggestion => {
                        suggestion.addEventListener('click', function () {
                            // Set the input value to the clicked suggestion
                            document.getElementById('word').value = this.textContent;
                            // Clear the suggestions
                            suggestionsList.innerHTML = '';
                        });
                    });
                })
                .catch(function (error) {
                    console.error('Error fetching suggestions from Firestore:', error);
                });

            // List items in the "Definition" or "Traduction" path in Firebase Storage
            const storagePath = handleRadioClick('DefinitionVid') ? 'Definition' : 'Traduction';
            const storageRef = firebase.storage().ref().child(storagePath);

            const storagePromise = storageRef.listAll().then(function (result) {
                // Filter files that contain the query in their name
                const matchingFiles = result.items.filter(item => {
                    const fileName = item.name.toLowerCase();
                    return fileName.includes(query);
                });

                console.log('Firebase Storage suggestions fetched successfully!', matchingFiles);

                // Display Storage suggestions or no word message
                if (matchingFiles.length > 0) {
                    matchingFiles.slice(0, 5).forEach(file => {
                        const fileNameWithoutExtension = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
                        const suggestionItem = document.createElement('li');
                        suggestionItem.textContent = fileNameWithoutExtension;
                        suggestionsList.appendChild(suggestionItem);
                    });
                } else {
                    const noWordItem = document.createElement('li');
                    noWordItem.textContent = 'No words found';
                    suggestionsList.appendChild(noWordItem);
                }

                // Add event listener for each Storage suggestion
                suggestionsList.querySelectorAll('li').forEach(suggestion => {
                    suggestion.addEventListener('click', function () {
                        // Set the input value to the clicked suggestion
                        document.getElementById('word').value = this.textContent;
                        // Clear the suggestions
                        suggestionsList.innerHTML = '';
                    });
                });
            })
                .catch(function (error) {
                    console.error('Error fetching suggestions from Firebase Storage:', error);
                });

            // Wait for both promises to resolve
            Promise.all([firestorePromise, storagePromise]).then(() => {
                // Check if suggestions list is empty, add "No words found" message
                if (suggestionsList.children.length === 0) {
                    const noWordItem = document.createElement('li');
                    noWordItem.textContent = 'No words found';
                    suggestionsList.appendChild(noWordItem);
                }
            });
        }
    } else {
        alert('Select Definition or Traduction');
        return;
    }
});

    
    
    const collapsibleBtns = document.querySelectorAll('.collapsible-btn');
    collapsibleBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            const icon = this.querySelector('i');
            if (content.style.display === 'grid') {
                content.style.display = 'none';
                icon.classList.remove('fa-chevron-circle-up');
                icon.classList.add('fa-chevron-circle-down');
            } else {
                content.style.display = 'grid';
                icon.classList.remove('fa-chevron-circle-down');
                icon.classList.add('fa-chevron-circle-up');
            }
        });
    });

    document.querySelectorAll('.nav-list a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    const addWordBtn = document.querySelector('#add-word-button');

    if (addWordBtn) {
        addWordBtn.addEventListener('click', function () {
            
            const lsqWord = document.getElementById('lsq-word').value;
            const definition = document.getElementById('definition').value;
            const lsqEntry = document.getElementById('lsq-entry').value;
            const videoUploadInput = document.getElementById('video-upload');
            var dropdown = document.getElementById("Dropdown");
            var selectedOption = dropdown.options[dropdown.selectedIndex].value;
            const selectedFileValue = videoUploadInput.value;
            const fileExtension = selectedFileValue.split('.').pop().toLowerCase();

            if (!lsqWord) {
                alert('Please enter a word.');
                return;
            }
            const wordsRef = firebase.firestore().collection('words').doc(lsqWord);
            wordsRef.get().then((doc) => {
                if(doc.exists){
                    const wordData = {};
                    if(handleRadioClick('Definition')){
                        if (selectedOption === "def") {
                            if (definition) {
                                wordData.definition = definition;
                            }else{
                                alert("Entrer une definition")
                            }
                        } else if (selectedOption === "up") {
                            if((fileExtension ==='wmv')){
                                alert("we don't accept wmv files")
                                return;
                            }else {
                                if (videoUploadInput && videoUploadInput.files.length > 0) {
                                    const file = videoUploadInput.files[0];
            
                                    const storage = firebase.storage();
                                    const storageRef = storage.ref();
                                    const videoRef = storageRef.child('Definition/' + file.name);
            
                                    videoRef.put(file).then((snapshot) => {
                                        console.log('Video uploaded successfully!');
                                        return snapshot.ref.getDownloadURL();
                                    }).then((downloadURL) => {
                                        if (!wordData.videos) {
                                            wordData.videos = [];
                                        }
                                        wordData.videos.push(downloadURL);
            
                                    }).catch((error) => {
                                        console.error('Error uploading video:', error);
                                    });
                                }else{
                                    alert("Upload a file")
                                    
                                }
                                
                            }
                        } else if (selectedOption === "lin") {
                            const isVideoLink = isVideo(definition);
                            if (definition||isVideoLink) {
                                wordData.videos = [definition];
                            }else{
                                alert("Entrer un lien d'une video de definition")
                            }
                        }
        
        
                    }else if(handleRadioClick('Traduction')){
                        if (selectedOption === "up") {
                            if(fileExtension ==='wmv'){
                                alert("we don't accept wmv files")
                                return;
                            }else {
                                if (videoUploadInput && videoUploadInput.files.length > 0 ) {
                                    const file = videoUploadInput.files[0];
            
                                    const storage = firebase.storage();
                                    const storageRef = storage.ref();
                                    const videoRef = storageRef.child('Traduction/' + file.name);
            
                                    videoRef.put(file).then((snapshot) => {
                                        console.log('Video uploaded successfully!');
                                        return snapshot.ref.getDownloadURL();
                                    }).then((downloadURL) => {
                                        if (!wordData.videos) {
                                            wordData.videos = [];
                                        }
                                        wordData.videos.push(downloadURL);
            
                                    }).catch((error) => {
                                        console.error('Error uploading video:', error);
                                    });
                                }else{
                                    alert("Upload a file")
                                    return;
                                }
                                
                            }
                        } else if (selectedOption === "lin") {
                            const isVideoLink = isVideo(lsqEntry);
                            if (lsqEntry||isVideoLink) {
                                wordData.videos = [definition];
                            }else{
                                alert("Entrer un lien d'une video de traduction")
                                return;
                            }
                        }
        
                    }else{
                        alert('Select Definition or Traduction')
                        return;
                    }
                    wordsRef.update(wordData).then(() => {
                        alert('Word updated successfully.');
                    }).catch((error) => {
                        console.error('Error updating word:', error);
                    });
                }else{
                    const wordData = {};
                    if(handleRadioClick('Definition')){
                        if (selectedOption === "def") {
                            if (definition) {
                                wordData.definition = definition;
                                console.log('wordData:', wordData);
                            }else{
                                alert("Entrer une definition")
                            }
                        } else if (selectedOption === "up") {
                                if(fileExtension ==='wmv'){
                                    alert("we don't accept wmv files")
                                    return;
                                }else {
                                if (videoUploadInput && videoUploadInput.files.length > 0) {
                                    const file = videoUploadInput.files[0];
            
                                    const storage = firebase.storage();
                                    const storageRef = storage.ref();
                                    const videoRef = storageRef.child('Definition/' + file.name);
            
                                    videoRef.put(file).then((snapshot) => {
                                        console.log('Video uploaded successfully!');
                                        return snapshot.ref.getDownloadURL();
                                    }).then((downloadURL) => {
                                        if (!wordData.videos) {
                                            wordData.videos = [];
                                        }
                                        wordData.videos.push(downloadURL);
            
                                    }).catch((error) => {
                                        console.error('Error uploading video:', error);
                                    });
                                }else{
                                    alert("Upload a file")
                                    
                                }
                            }
                        } else if (selectedOption === "lin") {
                            const isVideoLink = isVideo(definition);
                            if (definition||isVideoLink) {
                                wordData.videos = [definition];
                            }else{
                                alert("Entrer un lien d'une video de definition")
                            }
                        }
        
        
                    }else if(handleRadioClick('Traduction')){
                        if (selectedOption === "up") {
                            if(fileExtension ==='wmv'){
                                alert("we don't accept wmv files")
                                return;
                            }else {
                                if (videoUploadInput && videoUploadInput.files.length > 0) {
                                    const file = videoUploadInput.files[0];
            
                                    const storage = firebase.storage();
                                    const storageRef = storage.ref();
                                    const videoRef = storageRef.child('Traduction/' + file.name);
            
                                    videoRef.put(file).then((snapshot) => {
                                        console.log('Video uploaded successfully!');
                                        return snapshot.ref.getDownloadURL();
                                    }).then((downloadURL) => {
                                        if (!wordData.videos) {
                                            wordData.videos = [];
                                        }
                                        wordData.videos.push(downloadURL);
            
                                    }).catch((error) => {
                                        console.error('Error uploading video:', error);
                                    });
                                }else{
                                    alert("Upload a file")
                                    return;
                                }
                            }
                        } else if (selectedOption === "lin") {
                            const isVideoLink = isVideo(lsqEntry);
                            if (lsqEntry||isVideoLink) {
                                wordData.videos = [definition];
                            }else{
                                alert("Entrer un lien d'une video de traduction")
                                return;
                            }
                        }
        
                    }else{
                        alert('Select Definition or Traduction')
                        return;
                    }
                    wordsRef.set(wordData).then(() => {
                        alert('Word updated successfully.');
                    }).catch((error) => {
                        console.error('Error updating word:', error);
                    });
                }
            }).catch((error) => {
                console.error('Error getting document:', error);
            });
        });
    }
    
});




function handleRadioClick(radioType) {
    var radio = document.querySelector('input[value="' + radioType + '"]');
    console.log('radio',radio,radioType)
    
    if (radio && radio.checked) {
       return true;
    } else {
        return false;
    }
}

function checkSelection() {
    var dropdown = document.getElementById("Dropdown");
    var selectedOption = dropdown.options[dropdown.selectedIndex].value;

    
    document.getElementById("Link").style.display = "none";
    document.getElementById("Definition").style.display = "none";
    document.getElementById("Upload").style.display = "none";

    
    if (selectedOption === "def") {
        document.getElementById("Definition").style.display = "block";
    } else if (selectedOption === "up") {
        document.getElementById("Upload").style.display = "block";
    } else if (selectedOption === "lin") {
        document.getElementById("Link").style.display = "block";
    }
}

function radioDef() {
    
    var radioButtons = document.getElementsByName("radio");
    
    for (var i = 0; i < radioButtons.length; i++) {
      if (radioButtons[i].checked) {
        
        definition_op.style.display = "block";
        break;
      } else {
        
        definition_op.style.display = "none";
      }
    }
}

function radioTrad() {
    var radioButtons = document.getElementsByName("radio");
    for (var i = 0; i < radioButtons.length; i++) {
      if (radioButtons[i].checked) {
        
        definition_op.style.display = "none";
        break;
      } else {
        definition_op.style.display = "none";
      }
    }
}

function isVideo(url) {
    const youtubeRegExp = /^(https?:\/\/)?(www\.)?(youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const mp4RegExp = /\.(mp4)$/i;
    return youtubeRegExp.test(url) || mp4RegExp.test(url);
}

function playVideoFromStorageDef(fileName) {
    const storage = firebase.storage();
    const storageRef = storage.ref();
    const fileRef = storageRef.child('Definition/' + fileName + '.mp4');

    fileRef.getDownloadURL().then((url) => {
        console.log(`File '${fileName}' exists. URL: ${url}`);
        loadMP4Video(url);
    }).catch((error) => {
        console.error('Error getting download URL:', error);
    });
}

function playVideoFromStorageTrad(fileName) {
    const storage = firebase.storage();
    const storageRef = storage.ref();
    const fileRef = storageRef.child('Traduction/' + fileName + '.mp4');

    fileRef.getDownloadURL().then((url) => {
        console.log(`File '${fileName}' exists. URL: ${url}`);
        loadMP4Video(url);
    }).catch((error) => {
        console.error('Error getting download URL:', error);
    });
}

let currentVideoIndex = 0;
let player;
let videoUrls;

function searchLSQVideo() {
    const word = document.getElementById('word').value;

    if (word.length === 0) {
        alert('Please enter a word');
    }else{
        if(handleRadioClick('DefinitionVid')){
            const loaderElement = document.getElementById('loader');
            if (loaderElement) {
                loaderElement.style.display = 'block';
            }

            document.getElementById("video").style.backgroundColor = 'transparent';

            checkFileExistenceDef(word).then((fileExists) => {
                console.log('word;',fileExists)
                if (fileExists) {
                    playVideoFromStorageDef(word);
                } else {
                    const wordsRef = firebase.firestore().collection('words').doc(word);
                    wordsRef.get().then((doc) => {
                        if (doc.exists) {
                            const definition = doc.data().definition;
                            const videos = doc.data().videos;
                            videoUrls = videos;

                            if (!videoUrls && definition) {
                                performTranslations(definition);
                            } else if (videoUrls && videoUrls.length > 0) {
                                loadVideo(videoUrls[currentVideoIndex]);
                            } else {
                                alert('No videos available for this word.');
                                if (loaderElement) {
                                    loaderElement.style.display = 'none';
                                }
                            }
                        } else {
                            alert('Sorry, but there is no word in the dictionary.');
                            if (loaderElement) {
                                loaderElement.style.display = 'none';
                            }
                        }
                    }).catch((error) => {
                        console.error('Error getting document:', error);
                        if (loaderElement) {
                            loaderElement.style.display = 'none';
                        }
                    });
                }
            });        

        }else if(handleRadioClick('TraductionVid')){
            const loaderElement = document.getElementById('loader');
            if (loaderElement) {
                loaderElement.style.display = 'block';
            }

            document.getElementById("video").style.backgroundColor = 'transparent';

            checkFileExistenceTrad(word).then((fileExists) => {
                if (fileExists) {
                    playVideoFromStorageTrad(word);
                } else {
                    const wordsRef = firebase.firestore().collection('words').doc(word);
                    wordsRef.get().then((doc) => {
                        if (doc.exists) {
                            const traduction = doc.data().translations;
                            videoUrls = traduction;
                            if (videoUrls && videoUrls.length > 0) {
                                loadVideo(videoUrls[currentVideoIndex]);
                            } else {
                                alert('No videos available for this word.');
                                if (loaderElement) {
                                    loaderElement.style.display = 'none';
                                }
                            }
                        } else {
                            alert('Sorry, but there is no word in the dictionary.');
                            if (loaderElement) {
                                loaderElement.style.display = 'none';
                            }
                        }
                    }).catch((error) => {
                        console.error('Error getting document:', error);
                        if (loaderElement) {
                            loaderElement.style.display = 'none';
                        }
                    });
                }
            });

        }else{
            alert('Select Definition or Traduction')
            return;
        }
        
    }
}

function loadVideo(videoUrl) {
    return new Promise((resolve) => {
        const loaderElement = document.getElementById('loader');
        if (loaderElement) {
            loaderElement.style.display = 'block';
        }

        if (isYouTubeVideo(videoUrl)) {
            loadYouTubeVideo(videoUrl, resolve);
        } else {
            loadMP4Video(videoUrl, resolve);
        }
    });
}

function checkWordExistence(word) {
    const wordsRef = firebase.firestore().collection('words').doc(word);

    return wordsRef.get()
        .then((doc) => {
            return doc.exists; 
        })
        .catch((error) => {
            console.error('Error checking word existence:', error);
            return false; 
        });
}


function checkFileExistenceDef(fileName) {
    const storage = firebase.storage();
    const storageRef = storage.ref();
    const fileRef = storageRef.child('Definition/' + fileName+'.mp4');

    return fileRef.getDownloadURL()
        .then((url) => {
            console.log(`File '${fileName}' exists. URL: ${url}`);
            return true;
        })
        .catch((error) => {
            if (error.code === 'storage/object-not-found') {
                console.log(`File '${fileName}' does not exist.`);
                return false;
            } else {
                console.error('Error checking file existence:', error);
                throw error;
            }
        });
}

function checkFileExistenceTrad(fileName) {
    const storage = firebase.storage();
    const storageRef = storage.ref();
    const fileRef = storageRef.child('Traduction/' + fileName+'.mp4');

    return fileRef.getDownloadURL()
        .then((url) => {
            console.log(`File '${fileName}' exists. URL: ${url}`);
            return true;
        })
        .catch((error) => {
            if (error.code === 'storage/object-not-found') {
                console.log(`File '${fileName}' does not exist.`);
                return false;
            } else {
                console.error('Error checking file existence:', error);
                throw error;
            }
        });
}

function performTranslations(phrase) {
    const words = phrase.split(' ');
    let index = 0;

    function loadNextVideo() {
        return new Promise((resolve, reject) => {
            if (index < words.length) {
                const word = words[index];
                const translationRef = firebase.firestore().collection('words').doc(word);

                translationRef.get().then((doc) => {
                    if (doc.exists) {
                        const videos = doc.data().translations;

                        if (videos && videos.length > 0) {
                            loadVideo(videos[0]).then(() => {
                                index++;
                            });
                        } else {
                            console.log(`No videos available for the word: ${word}`);
                            index++;
                            resolve();  
                        }
                    } else {
                        console.log(`Word not found in the dictionary: ${word}`);
                        index++;
                        resolve();
                    }
                }).catch((error) => {
                    console.error('Error getting document:', error);
                    index++;
                    resolve(); 
                });
            } else {
                resolve();
            }
        });
    }

    async function loadVideos() {
        while (index < words.length) {
            await loadNextVideo();
        }
    }

    loadVideos(); 
}

function loadYouTubeVideo(videoUrl, resolve) {
    const videoContainer = document.getElementById('video');
    videoContainer.innerHTML = '';  

    const iframe = document.createElement('iframe');
    iframe.width = '560';
    iframe.height = '315';
    iframe.src = `https://www.youtube.com/embed/${videoUrl}?autoplay=1`;
    iframe.allow = 'autoplay; encrypted-media';  

    iframe.addEventListener('load', function () {
        resolve();
    });

    videoContainer.appendChild(iframe);
}

function isYouTubeVideo(url) {
    return url.includes('youtube.com');
}

function loadYouTubeVideo(videoUrl, resolve) {
    if (!player) {
        player = new YT.Player('video', {
            height: '315',
            width: '560',
            videoId: videoUrl,
            events: {
                'onReady': function (event) {
                    onPlayerReady(event);
                    event.target.addEventListener('onStateChange', function (state) {
                        if (state.data === YT.PlayerState.ENDED) {
                            resolve(); 
                        }
                    });
                }
            }
        });
    } else {
        player.loadVideoById(videoUrl);
    }
}

function loadMP4Video(videoUrl, resolve) {
    const videoContainer = document.getElementById('video');

    if (videoContainer) {
        videoContainer.innerHTML = '';
        const videoElement = document.createElement('video');
        videoElement.id = 'video';
        videoElement.width = '560';
        videoElement.height = '315';
        const sourceElement = document.createElement('source');
        sourceElement.src = videoUrl;
        sourceElement.type = 'video/mp4';
        videoElement.appendChild(sourceElement);
        videoContainer.appendChild(videoElement);
        videoElement.play();
        videoElement.addEventListener('ended', function () {
            resolve();
        });

        if (!videoElement.controls) {
            videoElement.controls = true;
            videoElement.addEventListener('click', function () {
                if (videoElement.paused) {
                    videoElement.play();
                } else {
                    videoElement.pause();
                }
            });

            videoElement.addEventListener('dblclick', function () {
                if (videoElement.requestFullscreen) {
                    videoElement.requestFullscreen();
                } else if (videoElement.mozRequestFullScreen) {
                    videoElement.mozRequestFullScreen();
                } else if (videoElement.webkitRequestFullscreen) {
                    videoElement.webkitRequestFullscreen();
                } else if (videoElement.msRequestFullscreen) {
                    videoElement.msRequestFullscreen();
                }
            });

            videoElement.addEventListener('contextmenu', function (event) {
                event.preventDefault();
                const playbackRates = [0.5, 1, 1.5, 2];
                const currentSpeedIndex = playbackRates.indexOf(videoElement.playbackRate);
                const nextSpeedIndex = (currentSpeedIndex + 1) % playbackRates.length;
                videoElement.playbackRate = playbackRates[nextSpeedIndex];
            });
        }
    }
}


$('form').on('submit', function (e) {
    e.preventDefault();
    $('#define-button').click();
});

function onPlayerReady(event) {
    event.target.playVideo();
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        currentVideoIndex = (currentVideoIndex + 1) % videoUrls.length;
        if (currentVideoIndex < videoUrls.length) {
            loadVideo(videoUrls[currentVideoIndex], () => {}); 
        }
    }
}

function youtube_parser(url) {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : false;
}

