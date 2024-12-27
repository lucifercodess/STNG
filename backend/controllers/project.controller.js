import Project from "../models/project.model.js";
import User from "../models/user.model.js";

export const createProject = async (req, res) => {
  const { name } = req.body;
  try {
    const projectExists = await Project.findOne({ name: name });
    if (projectExists) {
      return res
        .status(400)
        .json({ code: 0, message: "project already exists" });
    }
    const newProject = new Project({ name, users: [req.user._id] });
    await newProject.save();
    res.status(201).json({
      code: 1,
      message: "project created successfully",
      project: newProject,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ code: 0, message: "error in create project controller" });
  }
};

export const getProjectsForSpecificUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ code: 0, message: "user not found" });
    }
    const projects = await Project.find({ users: userId }).populate({
      path: "users",
      select: "-password",
    });
    res
      .status(200)
      .json({ code: 1, message: "projects fetched successfully", projects });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ code: 0, message: "error in get projects controller" });
  }
};

export const addUser = async (req, res) => {
  const {id} = req.params;
  const userId = req.user._id;
  const {userToAdd} = req.body;
  try {
    const user = await User.findById(userToAdd);
    if (!user) {
      return res.status(404).json({ code: 0, message: "user not found" });
    }
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ code: 0, message: "project not found" });
    }
    const isUserAlreadyInProject = project.users.some(
      (existingUserId) => existingUserId.toString() === userToAdd


    );
    if (isUserAlreadyInProject) {
      return res
        .status(400)
        .json({ code: 0, message: "User already added to project" });
    }

    project.users.push(userToAdd);
    await project.save();
    res
      .status(200)
      .json({ code: 1, message: "user added successfully", project });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ code: 0, message: "error in add user controller" });
  }
};

export const getProjectDetail = async(req,res)=>{
  const { id } = req.params;
  try {
    const project = await Project.findById(id).populate('users');
    if(!project){
      return res.status(404).json({ code: 0, message: "project not found" });
    }
    res.status(200).json({project});
  } catch (error) {
    console.log(error);
    return res
    .status(500)
    .json({ code: 0, message: "error in add get project detail controller" });
  }
}
