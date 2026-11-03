// One value per build: changes the stylesheet URL on every deploy so browsers never keep an old stylesheet.
export const BUILD_ID = Date.now().toString(36);
