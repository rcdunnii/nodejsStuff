<?php

function IsNullOrEmptyString($informalnames){
    $new = htmlspecialchars($informalnames);
    return (!isset($new) || trim($new)==='');
}



?>