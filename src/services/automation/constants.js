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
        GO_TO_SEARCH: 'span.nhsuk-action-link__text' // "Go to search" text
    },

    // Search selectors
    SEARCH: {
        KEYWORD_INPUT: '#keyword',
        LOCATION_INPUT: '#location',
        SEARCH_BUTTON: '#search',
        JOB_LINK_PATTERN: 'a[data-test="search-result-job-title"]' // Job result links
    },

    // Application detection
    APPLICATION: {
        START_APPLICATION_BUTTON: '#save_continue[value="Start Application"]',
        CONTINUE_BUTTON: '#save_continue',
        CONTINUE_LINK: '#continue' // Sometimes it's a link, not a button
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
        SAVE_CONTINUE: '#save_continue',
        CONTINUE: '#continue'
    },

    // Safeguarding step
    SAFEGUARDING: {
        TASK_LINK: '#safeguarding_task_link',
        CONTINUE_LINK: '#continue', // This is a link to start the section
        NO_CONVICTIONS: '#convictions_id_option_2',
        SAVE_CONTINUE: '#save_continue',
        CONTINUE: '#continue'
    },

    // Fitness to Practice step
    FITNESS_TO_PRACTICE: {
        TASK_LINK: '#fitness_to_practice_task_link',
        CONTINUE_LINK: '#continue', // Link to start section
        NO_OPTION: '#answer_id_option_2', // Used for multiple "No" selections
        SAVE_CONTINUE: '#save_continue',
        CONTINUE: '#continue'
    },

    // Guaranteed Interview Scheme step
    GUARANTEED_INTERVIEW: {
        TASK_LINK: '#gis_task_link',
        NO_PHYSICAL_LIMITATION: '#physical_limitation_id_option_2',
        NO_ARMED_FORCES: '#armedForcesVeteran_id_option_2',
        SAVE_CONTINUE: '#save_continue',
        CONTINUE: '#continue'
    },

    // Equality & Diversity step
    EQUALITY_DIVERSITY: {
        TASK_LINK: '#equality_and_diversity_task_link',
        CONTINUE_LINK: '#continue', // Link to start section
        GENDER_MALE: '#gender_choice_id_option_1',
        BIRTH_SEX_MATCH_YES: '#gender_same_at_birth_id_option_1',
        MARITAL_STATUS_SINGLE: '#marital_status_id_option_2',
        PREGNANCY_NO: '#pregnant_or_maternity_id_option_2',
        SEXUALITY_PREFER_NOT: '#describe_sexuality_id_option_7',
        AGE_RANGE_PREFER_NOT: '#age_range_id_option_7',
        ETHNICITY_PREFER_NOT: '#ethnicity_id_option_18',
        RELIGION_PREFER_NOT: '#religion_id_option_11',
        SAVE_CONTINUE: '#save_continue',
        CONTINUE: '#continue'
    },

    // Socio-Economic Background step
    SOCIO_ECONOMIC: {
        TASK_LINK: '#socio_economic_background_task_link',
        CONTINUE_LINK: '#continue', // Link to start section
        OCCUPATION_PREFER_NOT: '#mainHouseholdOccupation_option_10',
        SCHOOL_TYPE_PREFER_NOT: '#attendedSchoolType_option_7',
        FREE_MEALS_PREFER_NOT: '#eligibleForFreeSchoolMeals_option_6',
        SAVE_CONTINUE: '#save_continue',
        CONTINUE: '#continue'
    },

    // Declaration step
    DECLARATION: {
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
