import { Alert, Button, FormControl, IconButton, InputLabel, MenuItem, Modal, Select, Snackbar, Table, TableBody, TableCell, TableHead, TableRow, TextField } from "@mui/material"
import { useAuth } from "../context/useAuth";
import { useCallback, useEffect, useState } from "react";
import { MdDelete, MdDone, MdEdit } from "react-icons/md";

type Task = {
    id: number,
    title: string,
    description: string,
    status: string,
    created_at: string,
    created_by?: string
}

type User = {
    id: number,
    email: string,
    role: "admin" | "user"
}

function Dashboard() {
    const { token, signOut, fetchUser } = useAuth();
    const [ user, setUser ] = useState<User|null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [open, setOpen] = useState<boolean>(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [showSnackbar, setShowSnackbar] = useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = useState<{message: string, severity: "success" | "error"}>({message: '', severity: 'success'});

    const [editId, setEditId] = useState<number | null>(null);
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [status, setStatus] = useState<"created" | "in_progress" | "completed">("created");

    // function to fetch user data
    // usecallback to memoize the function for optimization
    const fetchingUser = useCallback(async () => {
        const data = await fetchUser();
        console.log("fetching user", data);
        setUser(data.data);
    }, [fetchUser]);

    // useEffect fetch the user data on page load.
    useEffect(() => {
        fetchingUser();
    }, []);

    
    /**
     * Show a snackbar with a given message and severity.
     * @param {string} message The message to be displayed in the snackbar.
     * @param {"success" | "error"} [severity="success"] The severity of the message.
     */
    const showMessage = (message: string, severity: "success" | "error" = 'success') => {
        setSnackbarMessage({message, severity});
        setShowSnackbar(true);
    }

    /**
     * Fetches all tasks from the API and updates the state with the fetched data.
     * If the API call fails, it logs an error to the console.
     */
    const fetchTasks = async () => {
        const response = await fetch(import.meta.env.VITE_API_URL + '/api/tasks/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            console.error("Error fetching tasks:", response.status, errData);
            return;
        }

        const data = await response.json();
        console.log("tasks", data);

        if(data){
            setTasks(data);
        }
    }

    useEffect(() => {
        fetchTasks();
    }, []);

    /**
     * Creates a new task in the API and updates the state with the fetched data.
     * If the API call fails, it shows an error message in a snackbar.
     * It also clears the title, description and status fields and closes the modal.
     */
    const handleCreateNewTasks = async () => {
        if(!title) return;

        const response = await fetch(import.meta.env.VITE_API_URL + '/api/tasks/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title,
                description
            })
        });

        if(!response.ok){
            showMessage('Failed to create task', "error");
            return;
        }

        const data = await response.json();
        if(data){
            showMessage(data.msg);
            fetchTasks();
            setTitle('');
            setDescription('');
            setStatus("created");
            setEditId(null);
            handleClose();
        }else{
            showMessage('Failed to create task');
        }
    }

    /**
     * Cancels the creation of a new task or editing an existing one.
     * It clears the title, description and status fields and closes the modal.
     */
    const handleCancel = () => {
        setTitle('');
        setDescription('');
        setEditId(null);
        handleClose();
    }

    /**
     * Deletes a task from the API and updates the state with the fetched data.
     * If the API call fails, it shows an error message in a snackbar.
     * It also updates the tasks state with the fetched data and shows a success message in a snackbar.
     * @param {number} id - The id of the task to delete.
     */
    const handleDelete = async (id: number) => {
        const response = await fetch(import.meta.env.VITE_API_URL + '/api/tasks/' + id, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if(!response.ok){
            showMessage('Failed to delete task', "error");
            return;
        }

        const data = await response.json();
        if(data.msg){
            showMessage(data.msg);
            fetchTasks();
        }
    }

    /**
     * Edits a task in the API and updates the state with the fetched data.
     * It sets the editId state to the given id, sets the title, description and status fields to the given values and opens the modal.
     * If the API call fails, it shows an error message in a snackbar.
     * It also updates the tasks state with the fetched data and shows a success message in a snackbar.
     * @param {number} id - The id of the task to edit.
     * @param {string} title - The title of the task to edit.
     * @param {string} description - The description of the task to edit.
     * @param {"created" | "in_progress" | "completed"} status - The status of the task to edit.
     */
    const handleEdit = async(id: number, title: string, description: string, status: string) => {
        setEditId(id);
        setTitle(title);
        setDescription(description);
        setStatus(status as "created" | "in_progress" | "completed");
        handleOpen();
    }

    /**
     * Updates a task in the API to set its status to "completed".
     * It shows an error message in a snackbar if the API call fails.
     * It also updates the tasks state with the fetched data and shows a success message in a snackbar.
     * It closes the modal after a successful update.
     * @param {number} id - The id of the task to update.
     */
    const handleDone = async (id: number) => {
        const response = await fetch(import.meta.env.VITE_API_URL + '/api/tasks/' + id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                status: "completed"
            })
        });

        if(!response.ok){
            showMessage('Failed to update task', "error");
            return;
        }

        const data = await response.json();
        if(data){
            showMessage(data.msg);
            fetchTasks();
            handleClose();
        }
    }

    /**
     * Submits the edited task data to the API and updates the state with the fetched data.
     * If the API call fails, it shows an error message in a snackbar.
     * It also updates the tasks state with the fetched data and shows a success message in a snackbar.
     * It closes the modal after a successful update.
     */
    const handleSubmitEdit = async () => {
        const response = await fetch(import.meta.env.VITE_API_URL + '/api/tasks/' + editId, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title,
                description,
                status
            })
        });

        if(!response.ok){
            showMessage('Failed to update task', "error");
            return;
        }

        const data = await response.json();
        if(data){
            showMessage(data.msg);
            fetchTasks();
            handleClose();
        }
    }

    return (
        <div className="w-screen h-screen flex flex-col p-5 items-start">
            <div className="w-full flex justify-end mb-5">
                <Button variant="contained" size="small" onClick={signOut}>Logout</Button>
            </div>
            <div className="flex flex-row justify-between w-full">
                <h2 className="text-2xl font-bold">Tasks</h2>
                <Button variant="contained" onClick={handleOpen}>Create new Task</Button>
            </div>

            <div className="w-full h-full items-center flex ">
                <div className="w-full h-full flex flex-col gap-2">
                    <Table sx={{ minWidth: 650 }} size="small" aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell className="font-bold">Title</TableCell>
                                <TableCell className="font-bold">Description</TableCell>
                                <TableCell className="font-bold" align="right">Status</TableCell>
                                {user?.role === "admin" && <TableCell className="font-bold" align="right">Created By</TableCell>}
                                <TableCell className="font-bold" align="right">Created At</TableCell>
                                <TableCell className="font-bold" align="right">Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                tasks ? tasks.map((task) => (
                                    <TableRow>
                                        <TableCell component="th" scope="row">
                                            {task.title}
                                        </TableCell>
                                        <TableCell >{task.description}</TableCell>
                                        <TableCell align="right"><p className={`${task.status == "completed" ? "text-green-500" : task.status == "pending" ? "text-yellow-500" : "text-black"} font-bold capitalize`}>{task.status}</p></TableCell>
                                        {task.created_by && <TableCell align="right">{task.created_by}</TableCell>}
                                        <TableCell align="right">{new Date(task.created_at).toLocaleString()}</TableCell>
                                        <TableCell align="right" className="flex flex-row gap-2">
                                            <IconButton color="success" sx={{ width: 40, height: 40 }} onClick={() => handleDone(task.id)} disabled={task.status === "completed"}>
                                                <MdDone />
                                            </IconButton>
                                            <IconButton sx={{ width: 40, height: 40 }} onClick={() => handleEdit(task.id, task.title, task.description, task.status)}>
                                                <MdEdit />
                                            </IconButton>
                                            <IconButton color="error" sx={{ width: 40, height: 40 }} onClick={() => handleDelete(task.id)}>
                                                <MdDelete />
                                            </IconButton>
                                        </TableCell>

                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <p>No tasks</p>
                                    </TableRow>
                                )
                            }
                        </TableBody>
                    </Table>
                </div>
            </div>

            <Modal
                open={open}
                onClose={handleCancel}
                aria-labelledby="modal-modal-title"
                className="flex items-center justify-center"
            >
                <div className="w-fit h-fit p-5 rounded-lg bg-white flex flex-col gap-5">
                    <h6 id="modal-modal-title">{editId ? "Edit a tasks" : "Create a new tasks"}</h6>

                    <form action="" className="flex flex-col gap-5">
                        <TextField id="outlined-basic" label="Title" variant="outlined" value={title} onChange={(e) => setTitle(e.target.value)} />
                        <TextField id="outlined-basic" label="Description" variant="outlined" value={description} onChange={(e) => setDescription(e.target.value)} />
                        <FormControl fullWidth>
                            <InputLabel id="status-label">Status</InputLabel>
                            <Select
                                labelId="status-label"
                                id="demo-simple-select"
                                value={status}
                                label="Status"
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <MenuItem value="created">Created</MenuItem>
                                <MenuItem value="pending">Pending</MenuItem>
                                <MenuItem value="completed">Completed</MenuItem>
                            </Select>
                        </FormControl>
                        <div className="flex flex-row justify-end gap-2">
                            <Button variant="outlined" color="error" onClick={handleCancel}>Cancel</Button>
                            {editId ?
                                <Button variant="contained" onClick={handleSubmitEdit} disabled={!title}>Update task</Button>
                                : <Button variant="contained" onClick={handleCreateNewTasks} disabled={!title}>Create task</Button>
                            }

                        </div>

                    </form>
                </div>
            </Modal>
            
            <Snackbar
                open={showSnackbar}
                autoHideDuration={3000}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setShowSnackbar(false)}
                    severity={snackbarMessage.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage.message}
                </Alert>
            </Snackbar>
        </div>
    )
}

export default Dashboard
