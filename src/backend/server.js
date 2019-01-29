const express = require('express');
const mongoose = require('mongoose');

let mongodbHost = 'http://127.0.0.1';

function getDatabase(db) {
    return `${mongodbHost}/${db}`;
}

mongoose.connect(getDatabase("nhl"));
mongoose.Promise = global.Promise;

let db = mongoose.connection;

