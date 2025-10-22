const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  likeProject,
  getCompletedProjects,
  incrementViews,
} = require("../controllers/project.controller");
const {
  verifyAdmin,
  adminLimiter,
} = require("../middlewares/admin.middelware");

const router = require("express").Router();

router.get("/", getAllProjects);
router.get("/completed", getCompletedProjects);
router.get("/:id", getProjectById);
router.post("/",adminLimiter, verifyAdmin, createProject);
router.put("/:id",adminLimiter, verifyAdmin, updateProject);
router.delete("/:id", verifyAdmin, deleteProject);

router.put("/:id/like", likeProject);
router.post('/:id/view', incrementViews);




module.exports = router;
