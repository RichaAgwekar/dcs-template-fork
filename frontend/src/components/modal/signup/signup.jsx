/**
 * Signup Component for handling user registration.
 * This component provides a sign-up form for users to register with their details,
 * and also offers options for signing up with GitHub or Google.
 *
 * @component
 * @example
 * // To use the Signup component, just import it and render in your JSX.
 * import Signup from './Signup';
 * <Signup />
 */

import React, {useEffect, useCallback} from 'react';
import axios from 'axios';
import {toast} from "react-toastify";
import {useForm} from "react-hook-form";
import Avatar from '@mui/material/Avatar';
import {Button, Link, Box, Typography, TextField, Container} from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';
import Divider from '@mui/material/Divider';
import MESSAGES from '../../../constants/config.js'
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import './signup.css'; // Import CSS for styling
import DcsCustomLink from '../../link/DcsCustomLink';
import DcsMicroLoader from "../../loader/DcsMicroLoader";
import {useNavigate, useSearchParams} from "react-router-dom";
import DcsAxiosInstance from "../../../api/dcs_axios";
import {DCSLogo} from "../../logo/DCSLogo";
// Constants
const GITHUB_CLIENT_ID = process.env.REACT_APP_GITHUB_CLIENT_ID;
const GITHUB_REDIRECT_URL = process.env.REACT_APP_GITHUB_REDIRECT_URL;
const REACT_APP_DCS_API_BASE_URL = process.env.REACT_APP_DCS_API_BASE_URL;
// const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID; //TODO :

axios.defaults.withCredentials = true

/**
 * Signup validation schema using Zod.
 * This schema defines the validation rules for the signup form.
 * It validates the email, first name, last name, password, and confirm password fields.
 * The confirm password must match the password field.
 */

const signupSchema = z.object({
    email: z.string().min(1, MESSAGES.SIGNUP_ERROR_MESSAGES.email).email(MESSAGES.SIGNUP_ERROR_MESSAGES.emailInvalid),
    first_name: z.string().min(1, MESSAGES.SIGNUP_ERROR_MESSAGES.firstname),
    last_name: z.string().min(1, MESSAGES.SIGNUP_ERROR_MESSAGES.lastname),
    password: z.string().min(6, MESSAGES.SIGNUP_ERROR_MESSAGES.password).refine(
        (value) => /^[a-zA-Z0-9_.-]*$/.test(value ?? ''),
        'password should contain only alphabets and numbers'
    ),
    confirm_password: z.string()
}).superRefine((data, ctx) => {

    if (data.confirm_password !== data.password) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "The passwords did not match",
            path: ['confirm_password']
        });
    }
});

/**
 * Signup component renders a form for user registration and provides GitHub and Google login options.
 *
 * @returns {JSX.Element} A signup form component.
 */
const Signup = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const {
        register,
        // getValues,
        handleSubmit,
        formState: {
            errors,
            isSubmitting
        }
    } = useForm({
        resolver: zodResolver(signupSchema)
    });

    /**
     * Handle successful server response for user authentication or registration.
     *
     * @param {Object} resp - The response object from the server.
     */
    const handleServerResponse = useCallback((resp) => {
        if (resp.status === 200) {
            const user = {
                'email': resp.data.email,
                'names': resp.data.full_name
            };
            localStorage.setItem('token', JSON.stringify(resp.data.access_token));
            localStorage.setItem('refresh_token', JSON.stringify(resp.data.refresh_token));
            localStorage.setItem('user', JSON.stringify(user));
            navigate('/welcome');
            toast.success('Login successful');
        }
    }, [navigate]);

    /**
     * Handle errors from the server during registration or authentication.
     *
     * @param {Object} error - The error object from the server response.
     */
    const handleServerError = useCallback((error) => {
        if (error.response) {
            console.log(error.response.data);
            toast.error(error.response.data.detail);
        }
    }, []);

 
    /**
     * Initiates the GitHub login by redirecting the user to GitHub OAuth.
     */   
    const handleGithubLogin = () => {
        // window.location.assign(`https://github.com/login/oauth/authorize/?client_id=${GITHUB_CLIENT_ID}`);
        const githubLoginUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_REDIRECT_URL}`;
        // window.location.href = githubLoginUrl;
        window.location.assign(githubLoginUrl)
    };
    /**
     * Sends GitHub authorization code to the server to complete the OAuth flow.
     * This function is triggered when the GitHub OAuth redirects back with an authorization code.
     */
    const sendGithubCodeToServer = useCallback(async () => {
        const urlParam = searchParams.get('code');
        if (urlParam) {
            try {
                const resp = await DcsAxiosInstance.post('auth/github/', {'code': urlParam});
                handleServerResponse(resp);
            } catch (error) {
                handleServerError(error);
            }
        }
    }, [searchParams, handleServerResponse, handleServerError]);
    useEffect(() => {
        const code = searchParams.get('code');
        if (code) {
            sendGithubCodeToServer();
        }
    }, [searchParams, sendGithubCodeToServer]);
    /**
     * Handles form submission for user registration.
     * On successful registration, redirects to the OTP verification page.
     *
     * @param {Object} data - The form data from the user.
     */
    const onSubmit = async (data) => {

        const dataToSend = {
            "username": data.email,
            "email": data.email,
            "first_name": data.first_name,
            "last_name": data.last_name,
            "password": data.password,
            "password2": data.confirm_password
        }
        try {
            const res = await axios.post( `${REACT_APP_DCS_API_BASE_URL}auth/register/` , dataToSend);
            console.log(res);
            const status = res.status;
            if (status === 201) {
                // navigate('/mail-confirmation',{ state: { success_message: res.message }});
                navigate("/otp/verify")
                toast.success(res.message)
            } else {
                navigate('/mail-error', {state: {message: res.message}});
            }
        } catch (err) {
            console.log(err)
            navigate('/mail-error', {state: {message: err.message}});
        }
    }

    return (
        <Container component="main" maxWidth="xs" sx={{
            marginTop: 1,
        zindex:2000}}>
            <Card elevation={10} sx={{
                zIndex:2000
            }} >
                <Box
                    sx={{
                        marginTop: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}>
                    <Avatar >
                        <DCSLogo sx={{
                            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)'
                        }} />
                    </Avatar>
                    <Typography variant="h6" color="textPrimary" textAlign="center" fontWeight="bold">
                        {/*Sign in {branding?.title ? `to ${branding.title}` : null}*/}
                        Sign Up
                    </Typography>
                    {/*<Typography variant="body2" color="textSecondary" textAlign="center">*/}
                    {/*    Welcome user, please sign up to continue*/}
                    {/*</Typography>*/}

                </Box>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} noValidate>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gridTemplateRows: 'repeat(5)',
                            gap: 1.5,
                            marginBottom: 1
                        }}>
                            <TextField
                                sx={{
                                    '& .MuiInputBase-root': {
                                        height: '36px', // Control the height of the input
                                        '& input': {
                                            padding: '0px 0px 0px 6x',
                                            fontSize: '14px'
                                        },
                                        '& fieldset': {
                                            borderRadius: '6px'
                                        },
                                    },
                                }}
                                {...register("first_name")}
                                error={!!errors.first_name}
                                helperText={errors.first_name ? errors.first_name.message : ''}
                                size="small"
                                required
                                fullWidth
                                id="first_name"
                                label="First Name"
                                name="first_name"
                                autoComplete="off"
                            />
                            <TextField
                                sx={{
                                    '& .MuiInputBase-root': {
                                        height: '36px',
                                        '& input': {
                                            padding: '0px 0px 0px 6x',
                                            fontSize: '14px'
                                        },
                                        '& fieldset': {
                                            borderRadius: '6px'
                                        },
                                    },
                                }}
                                {...register("last_name")}
                                error={!!errors.last_name}
                                helperText={errors.last_name ? errors.last_name.message : ''}
                                size='small'
                                fullWidth
                                required
                                id="last_name"
                                label="Last Name"
                                name="last_name"
                                autoComplete="off"
                            />
                            <TextField
                                sx={{
                                    '& .MuiInputBase-root': {
                                        height: '36px',
                                        '& input': {
                                            padding: '0px 0px 0px 6x',
                                            fontSize: '14px'
                                        },
                                        '& fieldset': {
                                            borderRadius: '6px'
                                        },
                                    },
                                }}
                                {...register("email")}
                                error={!!errors.email}
                                helperText={errors.email ? errors.email.message : ''}
                                size='small'
                                fullWidth
                                required
                                id="email"
                                label="Email"
                                name="email"
                                autoComplete="off"
                            />
                            <TextField
                                sx={{
                                    '& .MuiInputBase-root': {
                                        height: '36px',
                                        '& input': {
                                            padding: '0px 0px 0px 6x',
                                            fontSize: '14px'
                                        },
                                        '& fieldset': {
                                            borderRadius: '6px'
                                        },
                                    },
                                }}
                                {...register("password")}
                                error={!!errors.password}
                                type="password"
                                helperText={errors.password ? errors.password.message : ''}
                                size='small'
                                fullWidth
                                required
                                id="password"
                                label="Password"
                                name="password"
                                autoComplete="off"
                            />
                            <TextField
                                sx={{
                                    '& .MuiInputBase-root': {
                                        height: '36px',
                                        '& input': {
                                            padding: '0px 0px 0px 6x',
                                            fontSize: '14px'
                                        },
                                        '& fieldset': {
                                            borderRadius: '6px'
                                        },
                                    },
                                }}
                                {...register("confirm_password")}
                                error={!!errors.confirm_password}
                                helperText={errors.confirm_password ? errors.confirm_password.message : ''}
                                size='small'
                                type="password"
                                fullWidth
                                required
                                id="confirm_password"
                                label="Confirm Password"
                                name="confirm_password"
                                autoComplete="off"
                            />
                        </Box>
                        <Button type="submit" variant="contained" fullWidth size="small">
                            {isSubmitting ? (
                                <span>
                                     <DcsMicroLoader size={16} showLabel={false} color={'white'}/>
                                    </span>
                            ) : (
                                'Sign up'
                            )}
                        </Button>
                        <Divider className="text-sm"
                                 sx={{
                                     opacity: 0.8,
                                     fontSize: 12,
                                     paddingTop: 0.8,
                                     paddingBottom: 0.8
                                 }}>OR</Divider>
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: 1
                        }}>
                            <Button variant="contained" startIcon={<GoogleIcon/>} size="small">
                                Google
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<GitHubIcon/>}
                                size="small"
                                onClick={handleGithubLogin}
                                type={"button"}
                            >
                                GitHub
                            </Button>
                        </Box>
                        <Box sx={{paddingTop: 1}} className="app__link">Already registered?&nbsp;&nbsp;
                            <DcsCustomLink
                                linkText={"Sign In"}
                                targetPath={"/"}
                                color={'#1976d2'}
                                key={"login"}
                                variant={"body3"}
                            />
                            <Typography variant="caption" >
                                By Signing Up, you agree to our
                                <Link href="/terms-conditions" className="app__link">Terms & Condition | </Link>
                                <Link href="/privacy-policy" className="app__link"> Privacy Policy</Link>
                            </Typography>
                        </Box>
                    </form>
                </CardContent>
            </Card>
        </Container>
    );
};


export default Signup;