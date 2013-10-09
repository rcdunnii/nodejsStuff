<?php

	require 'db.inc';
	
// get walnutID from referrer
	
	if (!($nutID = $_GET['value'])){
		print "No nut ID # - nut cannot be deleted...";
		return;
	}
		
	// connect to the database

	$mysqli = new mysqli($server, $user, $password, $database);
	
	if ($mysqli->connect_errno) {
		echo "Failed to connect to MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error;
	}
	// create a prepared statement 
	if ( !($stmt = $mysqli->prepare("DELETE FROM nuts WHERE walnutID = ?"))) {
		 echo "Prepare failed: (" . $mysqli->errno . ") " . $mysqli->error;
		return;
	}
	
	// Bind parameters (an integer and a string). 'is' tells MySQL you're passing an integer(i) and a string(s)
	$stmt->bind_param('i', $nutID); 

	if ($stmt == false) 
	{ // bind error
		printf("bind_param error: %s %d\n",$stmt->error,$stmt->errno);
		return;
	}
	
	$stmt->execute();
	
	if($stmt == false)
	{
		printf("execute: %s %d\n",$stmt->error,$stmt->errno);
		return;
	}
				
	$stmt->close();		
	
	// header('Location: ' . $_SERVER['HTTP_REFERER']);
    return; // return to caller which is javascript function confirmDel() in main.js


?>