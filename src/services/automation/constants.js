// src/services/automation/constants.js

module.exports = {
    // Base URLs
    URLS: {
        NHS_CANDIDATE_HOME: 'https://www.jobs.nhs.uk/candidate',
        NHS_SEARCH: 'https://www.jobs.nhs.uk/candidate/search',
        NHS_APPLICATION_BASE: 'https://www.jobs.nhs.uk/candidate/application',
        TRAC_JOBS: 'apps.trac.jobs' // External domain to skip
    },

    // Login selectors
    LOGIN: {
        SIGN_IN_LINK: '#candidate_sign_in',
        USERNAME_INPUT: '#username',
        PASSWORD_INPUT: '#password',
        SUBMIT_BUTTON: '#submit-button',
        GO_TO_SEARCH: 'span.nhsuk-action-link__text:has-text("Go to search")'
    },

    // Search selectors
    SEARCH: {
        KEYWORD_INPUT: '#keyword',
        LOCATION_INPUT: '#location',
        SEARCH_BUTTON: '#search',
        JOB_LINK_PATTERN: 'a[href^="/candidate/jobadvert/"]'
    },

    // Application detection
    APPLICATION: {
        START_APPLICATION_BUTTON: '#save_continue[value="Start Application"]',
        CONTINUE_BUTTON: '#save_continue[value="Continue"]',
        CONTINUE_BUTTON_ALT: '#continue'
    },

    // Contact Details step
    CONTACT_DETAILS: {
        TASK_LINK: '#contact_details_task_link',
        EMAIL_PREFERENCE: '#communication_preference_id_option_1',
        SAVE_CONTINUE: '#save_continue'
    },

    // Right to Work step
    RIGHT_TO_WORK: {
        TASK_LINK: '#right_to_work_task_link',
        YES_OPTION: '#rtw_choice_id_option_1',
        SAVE_CONTINUE: '#save_continue',
        CONTINUE: '#continue'
    },

    // CV step
    CV: {
        TASK_LINK: 'a[href*="/cv/input"]',
        CV_TEXTAREA: '#cv',
        SAVE_CONTINUE: '#save_continue'
    },

    // Safeguarding step
    SAFEGUARDING: {
        TASK_LINK: 'a[href*="safeguarding"]',
        NO_CONVICTIONS: '#convictions_id_option_2',
        SAVE_CONTINUE: '#save_continue',
        CONTINUE: '#continue'
    },

    // Fitness to Practice step
    FITNESS_TO_PRACTICE: {
        TASK_LINK: 'a[href*="fitness_to_practice"]',
        NO_OPTION: '#answer_id_option_2',
        SAVE_CONTINUE: '#save_continue',
        CONTINUE: '#continue'
    },

    // Guaranteed Interview Scheme step
    GUARANTEED_INTERVIEW: {
        TASK_LINK: 'a[href*="guaranteed_interview"]',
        NO_PHYSICAL_LIMITATION: '#physical_limitation_id_option_2',
        NO_ARMED_FORCES: '#armedForcesVeteran_id_option_2',
        SAVE_CONTINUE: '#save_continue'
    },

    // Equality & Diversity step
    EQUALITY_DIVERSITY: {
        TASK_LINK: 'a[href*="equality"]',
        GENDER: '#gender_choice_id_option_1',
        BIRTH_SEX_MATCH: '#gender_same_at_birth_id_option_1',
        MARITAL_STATUS: '#marital_status_id_option_2',
        PREGNANCY: '#pregnant_or_maternity_id_option_2',
        SEXUALITY: '#describe_sexuality_id_option_7',
        AGE_RANGE: '#age_range_id_option_7',
        ETHNICITY: '#ethnicity_id_option_18',
        RELIGION: '#religion_id_option_11',
        SAVE_CONTINUE: '#save_continue'
    },

    // Socio-Economic Background step
    SOCIO_ECONOMIC: {
        TASK_LINK: 'a[href*="socio"]',
        OCCUPATION: '#mainHouseholdOccupation_option_10',
        SCHOOL_TYPE: '#attendedSchoolType_option_7',
        FREE_SCHOOL_MEALS: '#eligibleForFreeSchoolMeals_option_6',
        SAVE_CONTINUE: '#save_continue'
    },

    // Declaration step
    DECLARATION: {
        TASK_LINK: 'a[href*="declaration"]',
        AGREE_CHECKBOX: '#declaration_id',
        SEND_APPLICATION: '#send_application'
    },

    // Timeouts (in milliseconds)
    TIMEOUTS: {
        SHORT: 3000,
        MEDIUM: 5000,
        LONG: 10000,
        NAVIGATION: 30000
    }
};
