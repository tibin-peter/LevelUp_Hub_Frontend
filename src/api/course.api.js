import api from "./axios";

// Public: Get all available courses
export const getAllCourses = async () => {
    const response = await api.get("/courses");
    return response.data;
};

// Public: Get details of a specific course
export const getCourseDetails = async (id) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
};

// Mentor: Get courses added to the mentor's profile
export const getMentorCourses = async () => {
    const response = await api.get("/mentor/courses");
    return response.data;
};

// Mentor: Add a course to their profile
export const addCourseToMentor = async (courseId) => {
    const response = await api.post("/mentor/courses", { course_id: Number(courseId) });
    return response.data;
};

// Public: Get mentors teaching a specific course
export const getMentorsByCourse = async (courseId) => {
    const response = await api.get(`/courses/${courseId}/mentors`);
    return response.data;
};
