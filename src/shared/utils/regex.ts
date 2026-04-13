export const objectIdRegex = /^[a-fA-F0-9]{24}$/;

export const addressLineRegex = /^[a-zA-Z0-9 .,#-]{10,150}$/;

export const landMarkRegex = /^[A-Za-z0-9 ,./#@()\-]{5,150}$/

export const phoneRegex = /^\+?[0-9\s\-().]{7,20}$/;

export const placeRegex = /^[a-zA-Z .-]{3,50}$/;

export const cityRegex = /^[a-zA-Z ]{3,50}$/;

export const districtRegex = /^[a-zA-Z ]{3,50}$/;

export const pincodeRegex = /^[A-Za-z0-9\s-]{3,12}$/;

export const stateRegex = /^[a-zA-Z ]{2,50}$/;

export const countryRegex = /^[a-zA-Z ]{2,50}$/;

export const usernameRegex = /^[a-zA-Z ]{4,30}$/;

export const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,50}$/;

export const descriptionRegex = /^[\w\d\s!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]{10,200}$/;

export const appServiceNameRegex = /^[A-Za-z0-9 ]{4,50}$/;

export const serviceNameRegex = /^[A-Za-z ]{4,50}$/;

export const serviceDescriptionRegex = /^[\w\d !"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]{10,500}$/;

export const adhaarRegex = /^\d{6}$/;

export const providerExperienceRegex = /^[\w\d !"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]{1,500}$/;

export const serviceExperienceRegex = /^[\w\d !"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]{1,500}$/;

export const verificationRejectionReasonRegex = /^[A-Za-z0-9\s.,\-_'()@#!?&/:]+$/;

export const sessionIdRegex=/^cs_test_[a-zA-Z0-9]{5,200}$/;

export const timeRegex = /^(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/;