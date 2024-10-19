/**
 * @file ResetPassword.js
 * @description This file contains the `ResetPassword` component which provides a user interface for resetting the password. It integrates form validation using Zod schema, form handling with React Hook Form, and an API call for submitting the new password. The component handles errors and feedback using toast notifications and displays loading states during form submission.
 */

import React from 'react'
import {z} from 'zod';
import { useParams, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import AxiosInstance from '../../api/dcs_axios';
import {
    Button,
    Card,
    Container, TextField
} from "@mui/material";
import {Box, Typography} from "@mui/material";
import CardContent from "@mui/material/CardContent";
import DcsMicroLoader from "../loader/DcsMicroLoader";
import MESSAGES from "../../constants/config";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import Avatar from "@mui/material/Avatar";
import {DCSLogo} from "../logo/DCSLogo";

/**
 * @constant
 * @type {ZodSchema}
 * @description Schema for validating password and confirm password fields using Zod. It ensures that both fields are filled and validated according to predefined error messages.
 */
const passwordSchema = z.object({
    password: z.string().min(1, MESSAGES.SIGNUP_ERROR_MESSAGES.password),
    confirm_password: z.string().min(1, MESSAGES.SIGNUP_ERROR_MESSAGES.confirmPassword)
});

/**
 * ResetPassword Component
 * @component
 * @description The `ResetPassword` component provides a form for users to reset their password. It validates the password and confirm password fields, ensures correct data submission, and sends an API request to update the password. In case of success, the user is redirected to the login page, and a success toast notification is shown. The component displays a loader during the submission process.
 *
 * @returns {JSX.Element} A form interface for resetting the password.
 *
 * @example
 * // Usage in a React Router setup
 * import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
 * 
 * function App() {
 *   return (
 *     <Router>
 *       <Routes>
 *         <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
 *       </Routes>
 *     </Router>
 *   );
 * }
 */
const ResetPassword = () => {
    const navigate=useNavigate()
    const {uid, token}=useParams()
    const {
        register,
        getValues,
        handleSubmit,
        formState: {errors,
            isSubmitting}} = useForm({
        resolver: zodResolver(passwordSchema)
    });

    /**
     * onSubmit function
     * @function
     * @description Handles the form submission, collects form data, and sends a PATCH request to reset the password. If successful, it navigates the user to the login page and shows a success toast message.
     * @returns {Promise<void>} An asynchronous function that triggers on form submission.
     */
    const onSubmit = async () => {
        const formData = getValues();
        console.log(formData)
        // clearErrors();
        const data={
            "password":formData.password,
            "confirm_password":formData.confirm_password,
            "uidb64":uid,
            "token": token,
        }
        if (data) {
            const res = await AxiosInstance.patch('auth/set-new-password/', data)
            const response = res.data
            if (res.status === 200) {
                navigate('/login')
                toast.success(response.message)
            }
            console.log(response)
        }
    };


    return (
        <div>
            <Container component="main" maxWidth="xs" sx={{marginTop: 1}}>
                <Card elevation={8}>
                    <Box
                        sx={{
                            marginTop: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}>
                        <Avatar>
                            <DCSLogo sx={{
                                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)'
                            }}/>
                        </Avatar>
                        <Typography variant="h6" color="textPrimary" fontWeight={"bold"} textAlign="center">
                            Enter your New Password
                        </Typography>
                    </Box>
                    <CardContent>
                        <form  onSubmit={handleSubmit(onSubmit)} noValidate>
                            <TextField
                                {...register("password")}
                                error={!!errors.password}
                                helperText={errors.password ? errors.password.message : ''}
                                margin="normal"
                                size='small'
                                fullWidth
                                label="New Password"
                                type={"password"}
                                autoComplete="off"
                            />
                            <TextField
                                {...register("confirm_password")}
                                error={!!errors.confirm_password}
                                helperText={errors.confirm_password ? errors.confirm_password.message : ''}
                                margin="normal"
                                size='small'
                                fullWidth
                                label="Confirm Password"
                                autoComplete="off"
                                type={"password"}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                size="small">
                                {isSubmitting ? (
                                    <span>
                                      <DcsMicroLoader
                                          size={16}
                                          showLabel={true}
                                          color={'white'}
                                          message={'Wait...'}
                                      />
                                </span> ) : (
                                    'Reset'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </Container>

        </div>
    )
}

export default ResetPassword