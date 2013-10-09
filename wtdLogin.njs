<?php
    session_start();   
  
    $response = "";

    // Your code here to handle a successful verification
    $str_json = json_decode($_POST['value'], true);

    //    get stored password for aunthenticated user from hash table
    require 'dbFoxy.inc';
    // $username = 'Foxy';
    // $password = 'Cynthia';  login password goes here - NOTE: different than mysql walnuts db password for user Foxy which is 'Noyer#6358'
    
    $mysqli = @ new mysqli($server, $user, $password, $database);
    
    /* check connection */
    if ($mysqli->connect_errno) {
        printf("Connect failed: %s\n", $mysqli->connect_error);
        exit();
    }

    if (!($stmt = $mysqli->prepare("SELECT Foxy FROM hash WHERE 1"))) {
        echo "Prepare failed: (" . $mysqli->errno . ") " . $mysqli->error;
        exit();
    }
        
    if (!$stmt->execute()) {
        echo "Execute failed: (" . $stmt->errno . ") " . $stmt->error;
        exit();
    }
    
    if (!($res = $stmt->get_result())) {
        echo "Getting result set failed: (" . $stmt->errno . ") " . $stmt->error;
        exit();
    }
    
    /* fetch object array */
    if (!($row = $res->fetch_assoc())) {
        echo "fetch of row from DB failed: (" . $stmt->errno . ") " . $stmt->error;
        exit();
    }

    // The first 64 characters of the hash is the salt
    $salt = substr($row['Foxy'], 0, 64);

    $hash = $salt . $str_json["password"];

    // Hash the password as we did before
    for ( $i = 0; $i < 100000; $i ++ ) {
        $hash = hash('sha256', $hash);
    }
    $hash = $salt . $hash;
    if ( $hash == $row['Foxy'] ) {
        include_once $_SERVER['DOCUMENT_ROOT'] . '/securimage/securimage.php';
        $securimage = new Securimage();
        if (isset($str_json["captcha_code"])){
            $captcha_code = $str_json["captcha_code"];
            if ($securimage->check($captcha_code) == false) {
                $response = "Incorrect Security Code<br />";
            } else {
                $response = "ok";
            }
        } else {
            $response = "Enter Security Code";
        }
    } else {
       $response = "Password incorrect"; 
    }
    echo ($response);
?>