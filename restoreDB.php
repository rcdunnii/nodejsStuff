<?php
require 'dbFoxy.inc';

/* walnuts database must exist before we can restore it */
 
        /* create database if not exist */
		
		$mysqli = new mysqli($server, $user, $password);

		/* check connection */
		if ($mysqli->connect_errno) {
			header('HTTP/1.1 500 Internal Server Booboo');
			header('Content-Type: text/plain');
			die("Cannot connect to mysqld");
		}
		
		/* sql query with CREATE DATABASE */
		$sql = "CREATE DATABASE IF NOT EXISTS $database DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci";

		// Performs the $sql query on the server to create the database
		$res = $mysqli->query($sql) ;

		if ($mysqli->error) {			
			$mysqli->close();
			header('HTTP/1.1 500 Internal Server Booboo');
			header('Content-Type: text/plain');
			die("Create database failed");
		}
		
		$mysqli->close();
		
$UploadDirectory    = 'db_backup/'; //Upload Directory, ends with slash & make sure folder exist


if (!file_exists($UploadDirectory)) {
	header('HTTP/1.1 500 Internal Server Booboo');
	header('Content-Type: text/plain');
    //destination folder does not exist  
    die("Make sure Upload directory exists!");
}


if($_POST)
{
   if(!isset($_POST['mName']) || strlen($_POST['mName'])<1)
    {
		header('HTTP/1.1 500 Internal Server Booboo');
        header('Content-Type: text/plain');
        //required variables are empty
        die("Title is empty!");
    }


    if(!isset($_FILES['mFile']))
	{	 
		header('HTTP/1.1 501 Internal Server Booboo');
        header('Content-Type: text/plain');
		die("No upload file chosen");
	}
	
	if($_FILES['mFile']['error'])
    {
		header('HTTP/1.1 502 Internal Server Booboo');
        header('Content-Type: text/plain');	
        //File upload error encountered
        die(upload_errors($_FILES['mFile']['error']));
    }

    $FileName           = strtolower($_FILES['mFile']['name']); //uploaded file name
    $FileTitle          = mysql_real_escape_string($_POST['mName']); // file title
    $FileExt            = substr($FileName, strrpos($FileName, '.')); //file extension
    $FileType           = $_FILES['mFile']['type']; //file type
    $FileSize           = $_FILES['mFile']["size"]; //file size
    $RandNumber         = rand(0, 9999999999); //Random number to make each filename unique.
    $uploaded_date      = date("Y-m-d H:i:s");
	$NewFileName        = "";

    if ((strtolower($FileExt)) !== ".sql")
    {        
            die('Unsupported File!' . $FileExt); //output error
    }


    //File Title will be used as new File name
 /*   $NewFileName = preg_replace(array('/s/', '/.[.]+/', '/^[\w\_.-]/'), array('_', '.', ''), strtolower($FileTitle));  */
	$replace="_";
	$pattern="/([[:alnum:]_\.-]*)/";
	$NewFileName = str_replace(str_split(preg_replace($pattern,$replace, $FileTitle)),$replace, $FileTitle);
    $NewFileName = $NewFileName.'_'.$RandNumber.$FileExt;
    //Rename and save uploded file to destination folder.
    $sqlFile     = $UploadDirectory . $NewFileName;
    
    
    if(move_uploaded_file($_FILES['mFile']["tmp_name"], $sqlFile ))
    {
         if (!@file_exists($sqlFile)) {
			header('HTTP/1.1 503 Internal Server Booboo');
			header('Content-Type: text/plain');
            //destination folder does not exist
            die("Make sure " . $sqlFile. " exist!"); 
         } 
		
		if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            if (file_exists("C:/xampp/")) {
                $mysql = "C:/xampp/mysql/bin/mysql.exe";
            } else if (file_exists("D:/xampp/")) {
                $mysql = "D:/xampp/mysql/bin/mysql.exe";
            }             
		} else {
			$mysql = "/usr/bin/mysql";
		}
		
        $restore = "$mysql --host $server --user $user  --password=$password $database <  $sqlFile"; 
        system($restore, $result);
   
       if (($result !== false) && ($result !== 0 )) {  // $result == 0 == false == success
		   header('HTTP/1.1 504 Internal Server Booboo');
           header('Content-Type: text/plain');
           //required variables are empty
           die('error restoring ' . $database . ' from file '. $sqlFile .' - error: ' . $result );
        } else {
		    return true;
		}
	
		
    }else{
		   header('HTTP/1.1 505 Internal Server Booboo');
           header('Content-Type: text/plain');
           //required variables are empty
            die('error moving uploaded File to ' . $sqlFile );
    }   
}    

//function outputs upload error messages, http://www.php.net/manual/en/features.file-upload.errors.php#90522
function upload_errors($err_code) {
    switch ($err_code) {
        case UPLOAD_ERR_INI_SIZE:
            return 'The uploaded file exceeds the upload_max_filesize directive in php.ini';
        case UPLOAD_ERR_FORM_SIZE:
            return 'The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form';
        case UPLOAD_ERR_PARTIAL:
            return 'The uploaded file was only partially uploaded';
        case UPLOAD_ERR_NO_FILE:
            return 'No file was uploaded';
        case UPLOAD_ERR_NO_TMP_DIR:
            return 'Missing a temporary folder';
        case UPLOAD_ERR_CANT_WRITE:
            return 'Failed to write file to disk';
        case UPLOAD_ERR_EXTENSION:
            return 'File upload stopped by extension';
        default:
            return 'Unknown upload error';
    }
}
?>